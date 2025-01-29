import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { serve } from "./deps.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";
import { connect } from "./deps.js";

const cachedProgrammingAssignmentService = cacheMethodCalls(programmingAssignmentService, []);

const SERVER_ID = crypto.randomUUID();
const redis = await connect({
  hostname: "redis",
  port: 6379,
});

const parseFeedback = (graderFeedback) => {
  let correct = false;
  let feedback = {
    explanation: "OK",
    output: ""
  };

  if (graderFeedback.includes("AssertionError")) {
    feedback.explanation = "Program returned incorrect value";
  } else if (graderFeedback.includes("SyntaxError")) {
    feedback.explanation = "Syntax Error";
  } else if (graderFeedback.includes("NameError")) {
    feedback.explanation = "Name Error: Function not defined correctly";
  } else if (graderFeedback.includes("Time out error")) {
    feedback.explanation = "Time out error";
  } else if (graderFeedback.includes("OK")) {
    correct = true;
  } else {
    feedback.explanation = "Unknown error";
  }

  feedback.output = graderFeedback;

  return { correct, feedback };
};

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${ SERVER_ID }`);
};

const handleGetAssignments = async ( request ) => {
  return Response.json(await cachedProgrammingAssignmentService.findAll());
};

const handleGetSolvedAssignments = async (request) => {
  const searchParams = new URL(request.url).searchParams;
  const solvedAssignments = await programmingAssignmentService.findSolvedAssignments(searchParams.get("user"))
  return Response.json(solvedAssignments);
};

const handlePostAssignment = async ( request ) => {
  const programmingAssignments = await cachedProgrammingAssignmentService.findAll();
  const requestData = await request.json();
  const testCode = programmingAssignments[requestData.assignment-1]["test_code"];
  const data = {
    userId: requestData.user,
    assignmentId: requestData.assignment,
    testCode: testCode,
    code: requestData.code,
  };

  const previousSubmissions = await programmingAssignmentService.findByUserIdAndassignmentId(
    data.userId,
    data.assignmentId
  );

  for (let i = 0; i < previousSubmissions.length; i++) {
    if (previousSubmissions[i].code === data.code) {
      const feedbackData = {
        correct: previousSubmissions[i].correct,
        feedback: JSON.parse(previousSubmissions[i].grader_feedback),
        status: previousSubmissions[i].status,
      };
      return new Response(JSON.stringify(feedbackData), {
        headers: { "Content-Type": "application/json" },
      });
    };
  };

  const submission = await programmingAssignmentService.addSubmission(
    data.assignmentId,
    data.code,
    data.userId
  );

  await redis.xadd(
    "submission-stream",
    "*",
    { user: data.userId, id: submission[0].id, code: data.code, testCode: testCode },
  );

  const feedbackData = {
    id: submission[0].id,
    correct: false,
    feedback: {
      explanation: "",
      output: "",
    },
    status: "pending",
  };

  return Response.json(feedbackData);
};
 
const handlePostSubmissionPending = async (request) => {
  const searchParams = await request.json();
  const user = searchParams.user;

  let lastId = "0";
  try {
    while (true) {
      const [submissionStream] = await redis.xreadgroup( // xreadgroup = messages that are not yet acknowledged
        [{ key: "submission-stream", xid: lastId }],
        { group: "Redis-Submission-Group", consumer: "Submission-Consumer", count: 10 }
      );

      if (!submissionStream || submissionStream.messages.length === 0) {
        break;
      }

      for (const message of submissionStream.messages) {
        if (message.fieldValues.user === user) {
          const id = message.fieldValues.id;
          return new Response(JSON.stringify({ pending: true, id: id }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      lastId = submissionStream.messages[submissionStream.messages.length - 1].xid;
    }

    return new Response(JSON.stringify({ pending: false }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error checking user in stream:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const handlePostSubmissionUpdate = async (request) => {
  const gradedSubmission = await request.json();
  const parsedOutput = parseFeedback(gradedSubmission.feedback);
  try {
    const feedbackJson = JSON.stringify(parsedOutput.feedback);

    await programmingAssignmentService.updateSubmission(
      gradedSubmission.id,
      "processed",
      feedbackJson,
      parsedOutput.correct
    );
    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error("Error updating submission status:", e);
    return new Response(JSON.stringify({ success: false }));
  }
};

const handleGetSubmission = async (request) => {
  try {
    const searchParams = await request.json();
    const submission = await programmingAssignmentService.findBySubmissionId(searchParams.id);
    const data = {
      status: submission[0].status,
      feedback: JSON.parse(submission[0].grader_feedback),
      correct: submission[0].correct,
    };
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error fetching submission:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const urlMapping = [
  {
    pattern: new URLPattern({ pathname: "/" }),
    method: "GET",
    fn: handleGetRoot,
  },
  {
    pattern: new URLPattern({ pathname: "/assignments" }),
    method: "GET",
    fn: handleGetAssignments,
  },
  {
    pattern: new URLPattern({ pathname: "/done-assignments" }),
    method: "GET",
    fn: handleGetSolvedAssignments,
  },
  {
    pattern: new URLPattern({ pathname: "/grade" }),
    method: "POST",
    fn: handlePostAssignment,
  },
  {
    pattern: new URLPattern({ pathname: "/pending-submission" }),
    method: "POST",
    fn: handlePostSubmissionPending,
  },
  {
    pattern: new URLPattern({ pathname: "/update-submission" }),
    method: "POST",
    fn: handlePostSubmissionUpdate,
  },
  {
    pattern: new URLPattern({ pathname: "/submission" }),
    method: "POST",
    fn: handleGetSubmission,
  }
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  try {
    return await mapping.fn(request, mappingResult);
  } catch (e) {
    console.error(e);
    return new Response(e.stack, { status: 500 })
  }
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
