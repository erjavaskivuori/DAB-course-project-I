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
};

const findSolvedAssignments = async (userId) => {
  return await sql`
    SELECT DISTINCT programming_assignment_id
    FROM programming_assignment_submissions
    WHERE user_uuid = ${userId} AND correct = true;
  `;
};

const findByUserIdAndassignmentId = async ( userId, programmingAssignmentId ) => {
  return await sql`
    SELECT code, correct, grader_feedback, status
    FROM programming_assignment_submissions
    WHERE user_uuid = ${userId} AND programming_assignment_id = ${programmingAssignmentId};
  `;
}

export { findAll, addSubmission, updateSubmission, findBySubmissionId, findSolvedAssignments, findByUserIdAndassignmentId };
