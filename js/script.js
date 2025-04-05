import spline from 'https://prod.spline.design/v1/runtime.js';

const canvas = document.getElementById('spline-canvas');
const app = new spline.Application(canvas);

app.load('https://my.spline.design/earthdayandnight-ae282d0334411b998142525a25612f9e/');
