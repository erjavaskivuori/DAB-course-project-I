<script>
  import { getContext } from "svelte";
  import { userUuid } from "../stores/stores.js";
  export let editorValue;
  export let nextAssignment;
  let submissionId = null;
  let gradingResult = null;
  let pending = false;

  const updateAssignments = getContext("updateAssignments");

  const submitToGrading = async () => {
    pending = true;
    gradingResult = null;

    const data = {
      assignment: nextAssignment.id,
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

  const moveToNextAssignment = async () => {
    await updateAssignments();
  };
</script>

<div class="w-screen min-h-screen bg-gray-900">
  <div class="mx-2">
    <button
      class="font-bold p-4 rounded my-10 text-white"
      class:bg-blue-500={!pending}
      class:hover:bg-blue-700={!pending}
      class:bg-gray-500={pending}
      on:click={submitToGrading}
      disabled={pending}
    >
      Submit for grading
    </button>

    {#if pending}
      <p class="text-xl text-yellow-400">Grading in progress...</p>

    {/if}

    {#if gradingResult && !pending}
      {#if gradingResult.correct}
        <p class="text-xl text-green-500">Your submission is correct!</p>
        <button
          class="bg-green-500 hover:bg-green-700 text-white font-bold p-4 rounded my-10 inline-flex items-center"
          on:click={moveToNextAssignment}
        >
          Move to next assignment
          <svg
            class="ms-2 h-5 w-6 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
      {:else}
        <p class="text-xl text-red-500">Your submission is incorrect. Feedback: {gradingResult.feedback.explanation}</p>
        <div>
          <h3 class="text-2xl my-4">Output:</h3>
          <pre>{gradingResult.feedback.output}</pre>
        </div>
      {/if}
    {/if}
  </div>
</div>