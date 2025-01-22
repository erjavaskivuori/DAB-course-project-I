import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM programming_assignments;`;
};

const addSubmission = async (programmingAssignmentId, code, userId) => {
  return await sql`
  INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid) 
  VALUES (${programmingAssignmentId}, ${code}, ${userId}) RETURNING id`;
};

const updateSubmission = async (submissionId, status, feedback, correct) => {
  await sql`
  UPDATE programming_assignment_submissions 
  SET status = ${status}, grader_feedback = ${feedback}, correct = ${correct} 
  WHERE id = ${submissionId}`;
};

const findBySubmissionId = async (submissionId) => {
  return await sql`
    SELECT status, grader_feedback, correct
    FROM programming_assignment_submissions
    WHERE id = ${submissionId};
  `;
}

export { findAll, addSubmission, updateSubmission, findBySubmissionId };
