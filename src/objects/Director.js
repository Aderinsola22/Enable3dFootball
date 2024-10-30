import {ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import {Keeper} from './Keeper.js';
import {Player} from './Player.js';
import {Team} from './Team.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import { Keyboard } from '@yandeu/keyboard';

export class Director{
    constructor(team,shade,scene){
        this.userTeam=team;
        this.shade=shade;
        this.scene=scene;
        this.keyboard = new Keyboard();
        this._createDirector(scene);

    }
    _createDirector(scene){
    this.director=new THREE.Group();   
   const orbit= scene.add.cylinder( {y:-4,radiusTop:3,radiusBottom:3,height:2,heightSegments:1,openEnded:true}, {basic:{color:'red'}}
    );
    orbit.name='orbit'

    const pointer= scene.add.cone(
        {x:orbit.position.x,y:orbit.position.y+7,radius:0.75,height:0.9,radiusSegments:8,heightSegments:1},
        {basic:{color:'yellow'}}
        );
        pointer.name='pointer';
        pointer.rotateZ(3.142)

 const arrow = scene.add.cone(
    {z:orbit.position.z+3,y:-3.5,radius:1.3,height:0.5,radiusSegments:3,heightSegments:1},
    {basic:{color:'green'}}
    );
    arrow.name='arrow';
   orbit.visible=false;
   this.director.add(pointer,orbit,arrow);
   this.director.position.setY(0.5);
   this.director.name="Director";
   scene.add.existing(this.director);
   this.director.visible=false;
    }
    _switchToNearestPlayer(){
       
            const filterDistBall=this.userTeam?.teamDistBall.filter(Number.isFinite)
            const minDistBall= Math.min(...filterDistBall);
            let target=null;
        this.scene.scene.traverse((obj)=>{
            if(obj.userData.distBall=== minDistBall){
                target=obj;
                this.currPlayer=target;
                target.userData.isPlayerControlled=true;
            }
            else{
                obj.userData.isPlayerControlled=false;
            }
           })
           target.add(this.director);
           this.director.visible=true;
    }

    _changeColor(){
        // Color for being with Kicking range
        if(this.currPlayer.userData.distBall>=2.0 && this,this.currPlayer.userData.distBall <=4.5 && this.currPlayer.userData.dotP>=0.50){
            this.currPlayer.children[1].children[2].material.color=new THREE.Color(0,0,1);
        }
        // TODO: ADD color for being within heading range and other special types of actions
        else{
            this.currPlayer.children[1].children[2].material.color=new THREE.Color(0,0.21,0);
        }
    }
    _update(){
       //fix bug- this crashes program if nothing is rendered before the callback to switch happens
        if(this?.userTeam){
        const changePlayer=this.keyboard.key('KeyL').isDown;
        this.keyboard.once.down('KeyL', keyCode => {
            this._switchToNearestPlayer();
        })

        }
        if(this.currPlayer){
            this._changeColor();
        }

        
          
    }

}