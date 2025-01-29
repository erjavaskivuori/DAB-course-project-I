<script context="module">
  import { setContext } from "svelte";
  export const updateAssignments = () => {};
</script>

<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import GradingButton from "./GradingButton.svelte";
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
    assignments = await getAssignments();
    solvedAssignments = await getSolvedAssignments();
    console.log(assignments);
    console.log(solvedAssignments);
    determineNextUnsolvedAssignment();
    loading = false;
  };

  const handleEditorChange = (event) => {
    editorValue = event.target.value;
    updateLineNumbers();
  };

  const updateLineNumbers = () => {
    const lines = editorValue.split("\n").length;
    lineNumbers = Array.from({ length: lines }, (_, i) => i + 1);
  };

  onMount(() => {
    fetchData();
    updateLineNumbers();
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
          <div class="flex mt-4">
            <div class="bg-gray-800 text-gray-400 p-2 text-right">
              {#each lineNumbers as lineNumber}
                <div>{lineNumber}</div>
              {/each}
            </div>
            <textarea
              bind:value={editorValue}
              on:input={handleEditorChange}
              class="bg-gray-800 text-white p-2 w-full mr-8 h-64 resize-none focus:outline-none"
              placeholder="Enter your code here..."
            ></textarea>
          </div>
          <GradingButton {editorValue} {nextAssignment} />
        </ul>
      {:else}
        <p>No unsolved assignments available</p>
      {/if}
    {/if}
  </div>
</div>