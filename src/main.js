import { MatchScene } from './core/MatchScene.js'
import { Project,PhysicsLoader } from 'enable3d'


const config= {scenes: [MatchScene], maxSubSteps: 4};
window.addEventListener('DOMContentLoaded', async () => {

    PhysicsLoader('./ammo',()=> new Project(config));
    
   });