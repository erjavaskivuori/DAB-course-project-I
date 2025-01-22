<script>
  import { onMount } from "svelte";
  import GradingButton from "./GradingButton.svelte";

  let editorValue = "";
  let lineNumbers = [];
  let id = 1;

  const getAssignments = async () => {
    const response = await fetch("/api/assignments");
    return await response.json();
  };

  let assignmentsPromise = getAssignments();

  const handleEditorChange = (event) => {
    editorValue = event.target.value;
    updateLineNumbers();
  };

  const updateLineNumbers = () => {
    const lines = editorValue.split("\n").length;
    lineNumbers = Array.from({ length: lines }, (_, i) => i + 1);
  };

  onMount(() => {
    updateLineNumbers();
  });
</script>

<div class="w-screen h-full bg-gray-900 text-white">
  <div class="mx-7">
    <h1>Programming assignments</h1>

  {#await assignmentsPromise}
    <p>Loading assignment</p>
  {:then assignments}
    {#if assignments.length == 0}
      <p>No programming assignments available</p>
    {:else}
      <ul>
        <h1 class="text-3xl font-bold pb-6 mt-3">Assignment {id}: {assignments[id-1].title}</h1>
        <p class="text-lg pb-8">{assignments[id-1].handout}</p>
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
        <GradingButton {editorValue} />
      </ul>
    {/if}
  {/await}
  </div>
</div>