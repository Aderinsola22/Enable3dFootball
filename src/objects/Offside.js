import {ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import {Keeper} from './Keeper.js';
import {Player} from './Player.js';
import {Team} from './Team.js';

export class Offside{
    constructor(scene,opponentOffsideLine,team,opponentPostName,ball){
        this.offsideLine=opponentOffsideLine;
        this.team=team;
        this.opponentPostName=opponentPostName;
        this.scene=scene;
        this.offsidePlayers=[];
        this.ball=ball;
        this.active=true;
    }
    _getOffsidePlayers(){
         let offPlayer=[];
         offPlayer.length=0;

     this.scene.scene.traverse((obj)=>{
         if((obj.userData.postassignment != this.opponentPostName) && obj.userData.objtype=='player')
         {
            if(this.offsideLine.name =='Team-1'){
               if(obj.position.x<this.offsideLine.position.x && obj.position.x< 0&& this.ball.ball.position.x>this.offsideLine.position.x){
                offPlayer.push(obj);
                this.offsidePlayers=[...offPlayer];
              //  console.log(this.offsidePlayers);
                this._checkOffside();
               }
            }

            if(this.offsideLine.name =='Team-2'){
                if(obj.position.x>this.offsideLine.position.x && obj.position.x> 0 && this.ball.ball.position.x<this.offsideLine.position.x) {
                    offPlayer.push(obj);
                    this.offsidePlayers=[...offPlayer];
             //   console.log(this.offsidePlayers);
                 this._checkOffside();
                }   
             }
         }
    })
    }

    _checkOffside(){
        if(this.ball.isKicked==true){
            this.offsidePlayers.forEach(pl=>{
             //   console.log(pl.name,'of',pl.userData.parent.team.teamName, "is offside do not let them touch the ball or it flags them offside");
            })

        }
    //    console.log(this.offsidePlayers);
        this._FlagOffside();

    }

    _FlagOffside(){
        this.scene.physics.collisionEvents.on('collision', data => {
            const { bodies, event } = data
            if(event==='start'){
                if(bodies[0]!=bodies[1]){
                    const isBallandOffPlayer= (bodies[0].name === 'Ball' && bodies[1].name === 'Body Part')||(bodies[1].name === 'Ball' && bodies[0].name === 'Body Part');
 
                 if(isBallandOffPlayer){   
                    const ball = (bodies[0].name =='Ball')?bodies[0]:bodies[1];
                    const bodypart=(bodies[0].name =='Body Part')?bodies[0]:bodies[1];
                //    console.log(this.offsidePlayers);
               //    console.log(bodypart.userData.parent)
                    if( this.offsidePlayers.includes(bodypart.userData.parent.player)){
                  //      console.log("OFF SIDE DETECTED")
                    }
                }
                }
            }

        })

    }

    _update(){
        if(this.active==true){
            this._getOffsidePlayers();
        }

    }
















}