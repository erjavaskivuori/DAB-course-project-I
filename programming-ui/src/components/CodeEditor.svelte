<script>
  import { onMount } from "svelte";
  export let lineNumbers;
  export let editorValue;

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
  })
</script>

<div class="flex mt-4">
  <div class="bg-gray-800 text-gray-400 p-2 text-right">
    {#each lineNumbers as lineNumber}
      <div>{lineNumber}</div>
    {/each}
  </div>
  <textarea
    bind:value={editorValue}
    on:input={handleEditorChange}
    class="bg-gray-800 text-white p-2 w-full h-64 resize-none focus:outline-none"
    placeholder="Enter your code here..."
    id="code_editor"
  ></textarea>
</div>