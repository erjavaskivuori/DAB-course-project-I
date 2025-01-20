import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { serve } from "./deps.js";
import { sql } from "./database/database.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const cachedProgrammingAssignmentService = cacheMethodCalls(programmingAssignmentService, ["findAll"]);

const SERVER_ID = crypto.randomUUID();

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${ SERVER_ID }`);
};

const handleGetAssignments = async ( request ) => {
  return Response.json(await cachedProgrammingAssignmentService.findAll());
};

const handlePostAssignment = async ( request ) => {
  const programmingAssignments = await cachedProgrammingAssignmentService.findAll();
  const requestData = await request.json();
  const testCode = programmingAssignments[0]["test_code"];
  const data = {
    testCode: testCode,
    code: requestData.code,
  };

  const response = await fetch("http://grader-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
}

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
    pattern: new URLPattern({ pathname: "/grade" }),
    method: "POST",
    fn: handlePostAssignment,
  }
]

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
    return new Response(e.stack, { status: 500 })
  }
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
