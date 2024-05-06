import { AppOne as App } from './AppOne';

console.log(`main.ts starting ${App.name}`);
window.addEventListener('DOMContentLoaded', async () => {
    let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    let app = await App.init(canvas);
    app.run();
});