const canvas = document.getElementById("loaderCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("startLoader");

let animationRunning = false;
let angle = 0;

// Set canvas size
canvas.width = 100;
canvas.height = 100;

function drawLoader() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 30;
    const lineWidth = 6;

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();

    // Rotating arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angle, angle + Math.PI / 2);
    ctx.strokeStyle = "#08f";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();

    angle += 0.1; // Rotation speed
}

function animate() {
    if (!animationRunning) return;
    drawLoader();
    requestAnimationFrame(animate);
}

button.addEventListener("click", () => {
    animationRunning = !animationRunning;
    if (animationRunning) {
        animate();
        button.textContent = "Stop Loading";
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        button.textContent = "Start Loading";
    }
});
