<script>
  import { userUuid } from "../stores/stores.js";
  export let editorValue = "";

  const submitToGrading = async () => {
    const data = {
      user: $userUuid,
      code: editorValue,
    };
    
    const response = await fetch("/api/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const jsonData = await response.json();
    console.log(jsonData);
    alert(JSON.stringify(jsonData));
  };
</script>

<div class="w-screen min-h-screen bg-gray-900">
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-10"
    on:click={submitToGrading}
  >
    Submit for grading
  </button>
</div>