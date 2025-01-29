<script context="module">
  import { setContext } from "svelte";
  export const updateAssignments = () => {};
</script>

<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import GradingButton from "./GradingButton.svelte";
  import CodeEditor from "./CodeEditor.svelte"
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

<div class="w-screen h-full bg-gray-900 text-white">
  <div class="mx-7">
    <h1>Programming assignments</h1>

    {#if loading}
      <p>Loading assignments...</p>
    {:else}
      {#if nextAssignment}
        <ul>
          <h1 class="text-3xl font-bold pb-6 mt-3">Assignment {nextAssignment.assignment_order}: {nextAssignment.title}</h1>
          <p class="text-lg pb-8">{nextAssignment.handout}</p>
          <CodeEditor bind:lineNumbers bind:editorValue />
          <GradingButton {editorValue} {nextAssignment} />
        </ul>
      {:else}
        <p>No unsolved assignments available</p>
      {/if}
    {/if}
  </div>
</div>