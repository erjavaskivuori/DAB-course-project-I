<script context="module">
  import { setContext } from "svelte";
  export const updateAssignments = () => {};
</script>

<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import GradingButton from "./GradingButton.svelte";
  import CodeEditor from "./CodeEditor.svelte"
  import ProgressBar from "./ProgressBar.svelte"
  import { userUuid } from "../stores/stores.js";

  let editorValue = "";
  let lineNumbers = [];
  let assignments = [];
  let solvedAssignments = [];
  let nextAssignment = null;
  let loading = true;

  const getAssignments = async () => {
    const response = await fetch("/api/assignments");
    return await response.json();
  };

  const getSolvedAssignments = async () => {
    const user = get(userUuid);
    const response = await fetch("/api/done-assignments?user=" + user, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  };

  const determineNextUnsolvedAssignment = () => {
    for (let assignment of assignments) {
      let assignmentSolved = false;
      for (let i = 0; i < solvedAssignments.length; i++) {
        if (assignment.id === solvedAssignments[i].programming_assignment_id) {
          console.log("Assignment " + assignment.id + " is already solved");
          assignmentSolved = true;
          break;
        }
      }
      if (!assignmentSolved) {
        nextAssignment = assignment;
        break;
      } else {
        nextAssignment = null;
      }
    }
  };

  const fetchData = async () => {
    editorValue = "";
    assignments = await getAssignments();
    solvedAssignments = await getSolvedAssignments();
    console.log(assignments);
    console.log(solvedAssignments);
    determineNextUnsolvedAssignment();
    loading = false;
  };

  onMount(() => {
    fetchData();
  });

  setContext("updateAssignments", fetchData);
</script>

<div class="flex w-full h-full flex-col items-center justify-center bg-gray-900 text-white">
  <div class="text-white">
    <div class="mx-7">
      <h1 class="text-4xl font-bold">Programming assignments</h1>
      <ProgressBar {solvedAssignments} {assignments} />
      {#if loading}
        <p>Loading assignments...</p>
      {:else}
        {#if nextAssignment}
          <ul>
            <h1 class="text-3xl font-bold my-4">Assignment {nextAssignment.assignment_order}: {nextAssignment.title}</h1>
            <p class="text-lg mb-8">{nextAssignment.handout}</p>
            <CodeEditor bind:lineNumbers bind:editorValue />
            <GradingButton {editorValue} {nextAssignment} />
          </ul>
        {:else}
          <p class="min-h-screen">No unsolved assignments available</p>
        {/if}
      {/if}
    </div>
  </div>
</div>
