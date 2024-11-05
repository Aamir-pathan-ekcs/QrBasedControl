const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
//Object that stores values of minimum and maximum angle for a value
const rotationValues = [
  { minDegree: 0, maxDegree: 30, value: 'Digital' },
  { minDegree: 31, maxDegree: 90, value: 'Print'},
  { minDegree: 91, maxDegree: 150, value: 'SD GenAI' },
  { minDegree: 151, maxDegree: 210, value: 'CGI & Packaging' },
  { minDegree: 211, maxDegree: 270, value: 'Audio/Video' },
  { minDegree: 271, maxDegree: 330, value: 'UX/UI/DEV' },
  { minDegree: 331, maxDegree: 360, value: 'Digital' },
];
//Size of each piece
const data = [16, 16, 16, 16, 16, 16];
//background color for each piece
var pieColors = [
  '#537bc4',
  '#acc236',
  '#166a8f',
  '#00a950',
  '#58595b',
  '#8549ba'
];
//Create chart
let myChart = new Chart(wheel, {
  //Plugin for displaying text on pie chart
  plugins: [ChartDataLabels],
  //Chart Type Pie
  type: "pie",
  data: {
    //Labels(values which are to be displayed on chart)
    labels: ['Print', 'Digital', 'UX/UI/DEV', 'Audio/Video', 'CGI & Packaging', 'SD GenAI'],
    //Settings for dataset/pie
    datasets: [
      {
        backgroundColor: pieColors,
        data: data,
      },
    ],
  },
  options: {
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      tooltip: false, // hide tooltip
      legend: {
        display: false, // hide legend
      },
      datalabels: {
        color: "#ffffff",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: 12.5 },
        rotation: (context) =>
          context.dataIndex * (360 / context.chart.data.labels.length) +
          360 / context.chart.data.labels.length / 2,
        anchor: 'center', // Center-aligns labels
        align: 'center',  // Vertically centers labels
      },
    },
  },
});
//display value based on the randomAngle
const valueGenerator = (angleValue) => {
  for (let i of rotationValues) {
    //if the angleValue is between min and max then display it
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      finalValue.innerHTML = `<div class="res">
      <h5>you won ${i.value}. </h5>
      </div>`;
      spinBtn.disabled = false;
      break;
    }
  }
};

//Spinner count
let count = 0;
//100 rotations for animation and last rotation for result
let resultValue = 101;
//Start spinning
spinBtn.addEventListener("click", () => {
  spinBtn.disabled = true;
  //Empty final value
  finalValue.innerHTML = `<p>Result!</p>`;
  //Generate random degrees to stop at
  let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);
  //Interval for rotation animation
  let rotationInterval = window.setInterval(() => {
    //Set rotation for piechart
    /*
    Initially to make the piechart rotate faster we set resultValue to 101 so it rotates 101 degrees at a time and this reduces by 1 with every count. Eventually on last rotation we rotate by 1 degree at a time.
    */
    myChart.options.rotation = myChart.options.rotation + resultValue;
    //Update chart with new value;
    myChart.update();
    //If rotation>360 reset it back to 0
    if (myChart.options.rotation >= 360) {
      count += 1;
      resultValue -= 5;
      myChart.options.rotation = 0;
    } else if (count > 15 && myChart.options.rotation == randomDegree) {
      valueGenerator(randomDegree);
      clearInterval(rotationInterval);
      count = 0;
      resultValue = 101;
    }
  }, 10);
});