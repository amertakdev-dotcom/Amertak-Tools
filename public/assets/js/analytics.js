/**
 * Live Stock Path Generator
 * Creates a jittery, realistic market line
 */
function generateMarketPath(isUp) {
    let points = [];
    const segments = 15;
    const width = 100;
    const height = 40;
    
    for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width;
        let y;
        
        if (isUp) {
            y = (height - 5) - (i * (height / segments)) + (Math.random() * 8 - 4);
        } else {
            y = 5 + (i * (height / segments)) + (Math.random() * 8 - 4);
        }
        
        y = Math.max(5, Math.min(35, y));
        points.push(`${x},${y}`);
    }

    const d = `M ${points.join(' L ')}`;
    const fillD = `${d} V 40 H 0 Z`;
    
    return { d, fillD };
}

/**
 * Circular Progress Update
 */
function updateProgress(current, max) {
    const progress = document.getElementById("progress");

    if (!progress) return;

    // calculate from max players
    const percent = max > 0 ? (current / max) * 100 : 0;

    // Convert to degrees
    const deg = percent * 3.6;

    progress.style.background = `
        conic-gradient(
            #ff0000 0deg,
            #ff0000 ${deg}deg,
            #1e293b ${deg}deg,
            #1e293b 360deg
        )
    `;

    progress.innerHTML = `<span>${current}</span>`;
} 

// Live Jitter Loop
setInterval(() => {
    const trendCard =
        document.getElementById('trendCard');

    if (!trendCard) return;
    
    const isUp =
        trendCard.classList.contains('trend-up');

    const paths = generateMarketPath(isUp);

    document.getElementById('trendLine')
        ?.setAttribute('d', paths.d);

    document.getElementById('trendFill')
        ?.setAttribute('d', paths.fillD);

}, 3000);
