import { grade } from "./services/gradingService.js";
import { connect } from "./deps.js";

const redis = await connect({
  hostname: "redis",
  port: 6379,
});

try {
  const redisInfo = await redis.xinfoGroups("submission-stream");
  console.log(`${redisInfo[0].name} group exists`);
} catch (e) {
  console.log("Redis group does not exist, creating it now");
  await redis.xgroupCreate(
    "submission-stream",
    "Redis-Submission-Group",
    0,
    true,
  );
};

while(true) {

  const [submissionStream] = await redis.xreadgroup(
    [{ key: "submission-stream", xid: ">" }],
    { group: "Redis-Submission-Group", consumer: "Submission-Consumer", count: 1 },
  );
  if (submissionStream) {
    const code = submissionStream.messages[0].fieldValues.code
    const testCode = submissionStream.messages[0].fieldValues.testCode
    const result = await grade(code, testCode);

    const data = {
      id: submissionStream.messages[0].fieldValues.id,
      feedback: result,
      };
     const programmingApiResponse = await fetch("http://programming-api:7777/update-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      await programmingApiResponse.json();

    await redis.xack(
      "submission-stream",
      "Redis-Submission-Group",
      submissionStream.messages[0].xid.unixMs,
    );
  };

  await new Promise(r => setTimeout(r, 500));
};
