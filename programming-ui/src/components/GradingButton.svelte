<script>
  import { userUuid } from "../stores/stores.js";
  export let editorValue = "";
  export let assignmentId = 1;
  let submissionId = null;
  let gradingResult = null;
  let pending = false;

  const submitToGrading = async () => {
    pending = true;
    gradingResult = null;

    const data = {
      assignment: assignmentId,
      user: $userUuid,
      code: editorValue,
    };

    const pendingSubmissionResponse = await fetch("/api/pending-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const pendingSubmission = await pendingSubmissionResponse.json();

    if (pendingSubmission.pending) {
      submissionId = pendingSubmission.id;
      alert("Your previous submission is still waiting for grading. Please wait for the result before submitting again.");
    } else {
      const gradeResponse = await fetch("/api/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      });

      gradingResult = await gradeResponse.json();
      submissionId = gradingResult.id;
    }

    do {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const submissionResponse = await fetch("/api/submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: submissionId }),
      });
      gradingResult = await submissionResponse.json();
    } while (gradingResult.status === "pending");

    pending = false;
    submissionId = null;
  };
</script>

<div class="w-screen min-h-screen bg-gray-900">
  <button
    class="font-bold p-4 rounded m-10 text-white"
    class:bg-blue-500={!pending}
    class:hover:bg-blue-700={!pending}
    class:bg-gray-500={pending}
    on:click={submitToGrading}
    disabled={pending}
  >
    Submit for grading
  </button>

  {#if pending}
    <p class="text-yellow-500">Grading in progress...</p>

  {/if}

  {#if gradingResult && !pending}
    {#if gradingResult.correct}
      <p class="text-green-500">Your submission is correct!</p>
    {:else}
      <p class="text-red-500">Your submission is incorrect. Feedback: {gradingResult.feedback.explanation}</p>
      <div>
        <h3 class="text-2xl my-4">Output:</h3>
        <pre>{gradingResult.feedback.output}</pre>
      </div>
    {/if}
  {/if}
</div>