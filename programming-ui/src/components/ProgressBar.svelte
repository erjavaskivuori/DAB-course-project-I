<script>
  export let solvedAssignments;
  export let assignments;

  let progress = 0;
  let points = 0;
  let maxPoints = 0;
  let allSolved = false;

  $: if (assignments && assignments.length > 0) {
    progress = solvedAssignments.length / assignments.length * 100;
    points = solvedAssignments.length * 100;
    maxPoints = assignments.length * 100;
  }
</script>

<div class="my-8 max-w-screen">
  <h1 class="my-7 text-xl font-bold" id="progress">
    Your progress: {points} / {maxPoints} points
  </h1>
  <div class="bg-gray-200 rounded-full h-4 dark:bg-gray-700">
    <div class="bg-green-600 h-4 rounded-full" style="width: {progress}%"></div>
  </div>
</div>
