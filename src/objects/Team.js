import _ from 'lodash-es';
import {Keeper} from './Keeper.js';
import {Player} from './Player.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as YUKA from 'yuka';
import {THREE} from 'enable3d'

export class Team{
    //future: redefine class and make keepermodel optional
    //future: implement formation in the class
    constructor(teamSize,teamName,playerModel,KeeperModel,goalassignment,shade,rot,size,ball,scene,xDirection,goalineTarget){
        this.teamSize=teamSize;
        this.teamName=teamName;
        this.playerModel=playerModel;
        this.KeeperModel=KeeperModel;
        this.goalassignment=goalassignment;
        this.kitColor=shade;
        this.startRotation=rot;
        this.size=size;
        this.ball=ball;
        this.teamList={};
        this.scene=scene
        this.xDirection=xDirection
        this.teamDistBall=[];
        this.teamDistPost=[];
        this.OFSLposx=null;
        this.goalScored=0;
        this.goalineTargetName=goalineTarget;
        this.lastTouched=false;
        this.check=false;

        if(this.teamSize===3){
         this._createTeam3v3();
        }

        if(this.teamSize===4){
            this._createTeam4v4();
        }

        if(this.teamSize===5){
          this._createTeam5v5();  
        }
        if(this.teamSize===8){
          this._createTeam8v8();
        }
        if(this.teamSize===11){
            this._createTeam11v11();
        }


    }
    _createTeam3v3(){
       this.teamList.GK=new Keeper(this.KeeperModel,'GK',this.ball,this); 
        this.teamList.PL1=new Player(this.playerModel,'1','midfielder',this.ball,this);
        this.teamList.PL2=new Player(this.playerModel,'2','forward',this.ball,this)
        const gltfloader= new GLTFLoader();
        //for the keeper
       gltfloader.load(this.KeeperModel,(gltf)=>{
            this.teamList.GK.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,100*this.xDirection,6,0)
        }) 
        //for the players
        const playerPromise=gltfloader.loadAsync(this.playerModel).then(gltf=>{
            this.teamList.PL1.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,50*this.xDirection,6,0)
        });
        Promise.all([playerPromise]).then(()=>{
            this.teamList.PL2.SetPlayer(this.scene,this.teamList.PL1.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,5*this.xDirection,6,0)

           });


    }

    //this will be our main test settings for matches till optimization with models is ready
    _createTeam4v4(){
        this.teamList.GK=new Keeper(this.KeeperModel,'GK',this.ball,this); 
        this.teamList.PL1=new Player(this.playerModel,'1','defender',this.ball,this)
        this.teamList.PL2=new Player(this.playerModel,'2','midfielder',this.ball,this);
        this.teamList.PL3=new Player(this.playerModel,'3','forward',this.ball,this)
        const gltfloader= new GLTFLoader();
        //for the keeper
        gltfloader.load(this.KeeperModel,(gltf)=>{
            this.teamList.GK.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,100*this.xDirection,6,0)
        }) 
        //for the players
        const playerPromise=gltfloader.loadAsync(this.playerModel).then(gltf=>{
            this.teamList.PL1.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,0)
        });
        Promise.all([playerPromise]).then(()=>{
            this.teamList.PL2.SetPlayer(this.scene,this.teamList.PL1.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,30*this.xDirection,6,0)
            this.teamList.PL3.SetPlayer(this.scene,this.teamList.PL2.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,5*this.xDirection,6,0)
           });
    }


    _createTeam5v5(){
        this.teamList.GK=new Keeper(this.KeeperModel,'GK',this.ball,this); 
        this.teamList.PL1=new Player(this.playerModel,'1','defender',this.ball,this);
        this.teamList.PL2=new Player(this.playerModel,'2','midfielder',this.ball,this);
        this.teamList.PL3=new Player(this.playerModel,'3','midfielder',this.ball,this);
        this.teamList.PL4=new Player(this.playerModel,'4','forward',this.ball,this);
        const gltfloader= new GLTFLoader();
        //for the keeper
        gltfloader.load(this.KeeperModel,(gltf)=>{
            this.teamList.GK.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,100*this.xDirection,6,0)
        })
        //for the players
        const playerPromise=gltfloader.loadAsync(this.playerModel).then(gltf=>{
            this.teamList.PL1.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,0)
        });
        Promise.all([playerPromise]).then(()=>{
            this.teamList.PL2.SetPlayer(this.scene,this.teamList.PL1.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,40)
            this.teamList.PL3.SetPlayer(this.scene,this.teamList.PL2.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,-40)
            this.teamList.PL4.SetPlayer(this.scene,this.teamList.PL3.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,5*this.xDirection,6,0)
           });


    }

    _createTeam8v8(){
        this.teamList.GK=new Keeper(this.KeeperModel,'GK',this.ball,this); 
        this.teamList.PL1=new Player(this.playerModel,'1','defender',this.ball,this);
        this.teamList.PL2=new Player(this.playerModel,'2','defender',this.ball,this);
        this.teamList.PL3=new Player(this.playerModel,'3','midfielder',this.ball,this);
        this.teamList.PL4=new Player(this.playerModel,'4','midfielder',this.ball,this);
        this.teamList.PL5=new Player(this.playerModel,'5','midfielder',this.ball,this);
        this.teamList.PL6=new Player(this.playerModel,'6','forward',this.ball,this);
        this.teamList.PL7=new Player(this.playerModel,'7','forward',this.ball,this);
        const gltfloader= new GLTFLoader();

        gltfloader.load(this.KeeperModel,(gltf)=>{
            this.teamList.GK.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,100*this.xDirection,6,0)
        })

        const playerPromise=gltfloader.loadAsync(this.playerModel).then(gltf=>{
            this.teamList.PL1.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,27)
        });
        Promise.all([playerPromise]).then(()=>{
            this.teamList.PL2.SetPlayer(this.scene,this.teamList.PL1.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,-27)
            this.teamList.PL3.SetPlayer(this.scene,this.teamList.PL2.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,-40)
            this.teamList.PL4.SetPlayer(this.scene,this.teamList.PL3.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,0)
            this.teamList.PL5.SetPlayer(this.scene,this.teamList.PL4.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,40)
            this.teamList.PL6.SetPlayer(this.scene,this.teamList.PL5.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,5*this.xDirection,6,27)
            this.teamList.PL7.SetPlayer(this.scene,this.teamList.PL6.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,5*this.xDirection,6,-27)
           });

    }

    _createTeam11v11(){
        this.teamList.GK=new Keeper(this.KeeperModel,'GK',this.ball,this); 
        this.teamList.PL1=new Player(this.playerModel,'1','defender',this.ball,this);
        this.teamList.PL2=new Player(this.playerModel,'2','defender',this.ball,this);
        this.teamList.PL3=new Player(this.playerModel,'3','defender',this.ball,this);
        this.teamList.PL4=new Player(this.playerModel,'4','defender',this.ball,this);
        this.teamList.PL5=new Player(this.playerModel,'5','midfielder',this.ball,this);
        this.teamList.PL6=new Player(this.playerModel,'6','midfielder',this.ball,this);
        this.teamList.PL7=new Player(this.playerModel,'7','midfielder',this.ball,this);
        this.teamList.PL8=new Player(this.playerModel,'8','midfielder',this.ball,this);
        this.teamList.PL9=new Player(this.playerModel,'9','forward',this.ball,this);
        this.teamList.PL10=new Player(this.playerModel,'10','forward',this.ball,this);
        const gltfloader= new GLTFLoader();

        gltfloader.load(this.KeeperModel,(gltf)=>{
            this.teamList.GK.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,100*this.xDirection,6,0)
        })

        const playerPromise=gltfloader.loadAsync(this.playerModel).then(gltf=>{
            this.teamList.PL1.SetPlayer(this.scene,gltf.scene.children[0],this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,45)
        });
        Promise.all([playerPromise]).then(()=>{
            this.teamList.PL2.SetPlayer(this.scene,this.teamList.PL1.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,12)
            this.teamList.PL3.SetPlayer(this.scene,this.teamList.PL2.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,-12)
            this.teamList.PL4.SetPlayer(this.scene,this.teamList.PL3.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,60*this.xDirection,6,-45)
            this.teamList.PL5.SetPlayer(this.scene,this.teamList.PL4.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,45)
            this.teamList.PL6.SetPlayer(this.scene,this.teamList.PL5.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,12)
            this.teamList.PL7.SetPlayer(this.scene,this.teamList.PL6.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,-12)
            this.teamList.PL8.SetPlayer(this.scene,this.teamList.PL7.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,35*this.xDirection,6,-45)
            this.teamList.PL9.SetPlayer(this.scene,this.teamList.PL8.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,5*this.xDirection,6,27)
            this.teamList.PL10.SetPlayer(this.scene,this.teamList.PL9.playerClone,this.goalassignment,this.kitColor,this.startRotation,this.size,5*this.xDirection,6,-27)
    
        });



    }

    _addOpponent(opponent){
        this.opponent=opponent;
    }

    _addGoalBox(goalBox){
        this.teamGoalBox=goalBox;
        this.scene.scene.traverse((obj)=>{
            if(obj.name==this.teamGoalBox){
              this.PenaltyBox=obj;
            }
        })
        
    }


    _teamTrack(){
        this.teamDistBall[0]= this.teamList?.GK?.distBall;
         this.teamDistBall[1]=this.teamList?.PL1?.distBall;
         this.teamDistBall[2]=this.teamList?.PL2?.distBall; 
         this.teamDistBall[3]=this.teamList?.PL3?.distBall;
         this.teamDistBall[4]=this.teamList?.PL4?.distBall;
         this.teamDistBall[5]=this.teamList?.PL5?.distBall;
         this.teamDistBall[6]=this.teamList?.PL6?.distBall; 
         this.teamDistBall[7]=this.teamList?.PL7?.distBall;
         this.teamDistBall[8]=this.teamList?.PL8?.distBall;
         this.teamDistBall[9]=this.teamList?.PL9?.distBall; 
         this.teamDistBall[10]=this.teamList?.PL10?.distBall;
    }

    _teamPostTrack(){
        this.teamDistPost[0]= this.teamList?.GK?.distPost;
         this.teamDistPost[1]=this.teamList?.PL1?.distPost;
         this.teamDistPost[2]=this.teamList?.PL2?.distPost; 
         this.teamDistPost[3]=this.teamList?.PL3?.distPost;
         this.teamDistPost[4]=this.teamList?.PL4?.distPost;
         this.teamDistPost[5]=this.teamList?.PL5?.distPost;
         this.teamDistPost[6]=this.teamList?.PL6?.distPost; 
         this.teamDistPost[7]=this.teamList?.PL7?.distPost;
         this.teamDistPost[8]=this.teamList?.PL8?.distPost;
         this.teamDistPost[9]=this.teamList?.PL9?.distPost; 
         this.teamDistPost[10]=this.teamList?.PL10?.distPost;
    }


    _targetOffsideLine(){
        const filterDistPost=this.teamDistPost.filter(Number.isFinite)
        filterDistPost.sort((a,b)=>a-b);
        const minDistPost= Math.min(...filterDistPost);

        const nextMin=filterDistPost.find(num => num >minDistPost);
          this.scene.scene.traverse((obj)=>{ 
            if(obj.userData.distPost=== nextMin){
              this.OFSLposx= obj.position.x;
            }
            
           })
    }

    _transferInfoToPlayers(){
        const goalPost=this.scene.scene.getObjectByName(this.goalassignment);
        Object.keys(this.teamList).forEach((key)=>{
            if (_.has(this.teamList[key],'player.userData.postassignment')){_.set(this.teamList[key],'player.userData.postassignment',this.goalassignment);}
            if (_.has(this.teamList[key],'post')){_.set(this.teamList[key],'post',goalPost)} 
        })            
    }

    ResetPlayers(eventType){

        if(eventType=='HalfTime'){
            Object.keys(this.teamList).forEach((key)=>{
                if (_.has(this.teamList[key],'player')){this.ResetHalf(this.teamList[key].player,this.teamList[key])};  
            })
        }
        //TODO:do the same based on event types
        //Goal
        else if(eventType=='Goal'){
            Object.keys(this.teamList).forEach((key)=>{
                if (_.has(this.teamList[key],'player')){this.ResetGoal(this.teamList[key].player,this.teamList[key])};  
            })
        }
        //Throw In
       else if(eventType=='ThrowIn'){
        const nonGkPlayers= Object.values(this.teamList).filter(pl =>pl.posName!='goalkeeper');
        //  console.log(nonGkPlayers);
        if(this.scene.ball.possessorTeamClass===this){
            const randPlayer= Math.floor(Math.random()*nonGkPlayers.length);
            this.throwInTaker=nonGkPlayers[randPlayer];
           // console.log(this.throwInTaker);
            this.scene.ball.possessorClass=this.throwInTaker;
            this.scene.ball.possessor=this.scene.ball.possessorClass.playerName;

            const nonThrowingPlayers=Object.values(this.teamList).filter(pl =>pl.posName!='goalkeeper'&& pl !=this.throwInTaker);
           // console.log(this.teamName,'Non throwin Players', nonThrowingPlayers);
            this.Pickrandom(nonThrowingPlayers);
        }
        else{
            this.throwInTaker=null;  
          //  console.log(this.teamName,'Non throwin Players',nonGkPlayers);
            this.Pickrandom(nonGkPlayers);
         }
         
        Object.keys(this.teamList).forEach((key)=>{
            if (_.has(this.teamList[key],'player')){this.ResetThrowIn(this.teamList[key].player,this.teamList[key])};  
        })
        }
        //Goal Kick
        else if(eventType=='GoalKick'){
            this.goalKickTaker= this.scene.ball.possessorTeamClass.teamList.GK;
            this.scene.ball.possessorClass=this.goalKickTaker;
            this.scene.ball.possessor=this.scene.ball.possessorClass.playerName;
            Object.keys(this.teamList).forEach((key)=>{
                if (_.has(this.teamList[key],'player')){this.ResetGoalKick(this.teamList[key].player,this.teamList[key])};  
            })
        }
        //Corner Kick
        else if(eventType=='CornerKick'){
            let mininsideBoxNum;

            // Possessing team logic
            if (this.scene.ball.possessorTeamClass === this) {
                const midfieldPlayers = Object.values(this.teamList).filter(pl => pl.posName === 'midfielder');
                const randMidfielder = Math.floor(Math.random() * midfieldPlayers.length);
            
                this.cornerTaker = midfieldPlayers[randMidfielder];
                this.scene.ball.possessorClass = this.cornerTaker;
                this.scene.ball.possessor = this.cornerTaker.playerName;
            
                mininsideBoxNum = Math.floor(this.teamSize / 2);
            
                // Define weights for possessing team
                const weightsMapping = { forward: 5, defender: 3, midfielder: 2 };
            
                this.insideBoxPlayersList = this.DetermineInsideBoxPlayers(this, this.cornerTaker, mininsideBoxNum, weightsMapping);
            
            } else {
                // Non-possessing team logic
                this.cornerTaker = null;
                mininsideBoxNum = Math.floor(this.teamSize / 2) + 1;
            
                // Define weights for non-possessing team
                const weightsMapping = { forward: 1, defender: 6, midfielder: 3 };
            
                this.insideBoxPlayersList = this.DetermineInsideBoxPlayers(this, this.cornerTaker, mininsideBoxNum, weightsMapping);
            }
           

            Object.keys(this.teamList).forEach((key)=>{
                if (_.has(this.teamList[key],'player')){this.ResetCornerKick(this.teamList[key].player,this.teamList[key])};  
            })
        }
    }

    CheckPlayers(eventType){
    if(eventType=='HalfTime'){
        this.check = Object.values(this.teamList).every((pl)=>pl?.ResetDone==true);
    }
    //TODO:do the same based on event types
    //Goal
    else if(eventType=='Goal'){
      this.check = Object.values(this.teamList).every((pl)=>pl?.ResetDone==true);
    }
    //Throw In
   else if(eventType=='ThrowIn'){
    if(this.throwInTaker!=null){
        const thrower = Object.values(this.teamList).find((pl)=>pl?.ResetDone==true && pl==this?.throwInTaker);
    if(thrower){
    this.check=true;
    this.opponent.check=true;
    }
    else{
    this.check =false;
    this.opponent.check=false;
    }
    }
   

    }
    //Goal Kick
    else if(eventType=='GoalKick'){
        this.check = Object.values(this.teamList).every((pl)=>pl?.ResetDone==true);
    }
    //Corner Kick
    else if(eventType=='CornerKick'){
        this.check = Object.values(this.teamList).every((pl)=>pl?.ResetDone==true);
    }
    }

    _ResetTransition(){
        this.teamList?.GK.stateMachine.changeTo('tendGoal');
        this.teamList?.PL1.stateMachine.changeTo('idle');
        this.teamList?.PL2.stateMachine.changeTo('idle'); 
        this.teamList?.PL3?.stateMachine.changeTo('idle');
        this.teamList?.PL4?.stateMachine.changeTo('idle');
        this.teamList?.PL5?.stateMachine.changeTo('idle');
        this.teamList?.PL6?.stateMachine.changeTo('idle'); 
        this.teamList?.PL7?.stateMachine.changeTo('idle');
        this.teamList?.PL8?.stateMachine.changeTo('idle');
        this.teamList?.PL9?.stateMachine.changeTo('idle'); 
        this.teamList?.PL10?.stateMachine.changeTo('idle');  
    }

  
    ResetHalf(player,PlClass){
        let xPos= Math.abs(PlClass.StartX) * this.xDirection;
        let zPos= PlClass.StartZ;
        PlClass.StartX=xPos;
        PlClass.StartZ=zPos;
        this.resetPosition= new YUKA.Vector3(xPos,3,zPos);
        this.resetPos=new YUKA.ArriveBehavior(this.resetPosition,3,1);
        PlClass.yukaPlayer.steering.add(this.resetPos);
        PlClass.stateMachine.changeTo('reset');
       // this.resetPos.active=true;  
    }

    ResetGoal(player,PlClass){
        //use initial half start position as the reset position and make team that scored stay out of circle then spawn the ball
        
        this.resetPosition= new YUKA.Vector3(PlClass.StartX,3,PlClass.StartZ);
        this.resetPos=new YUKA.ArriveBehavior(this.resetPosition,3,1);
        PlClass.yukaPlayer.steering.add(this.resetPos);
        PlClass.stateMachine.changeTo('reset');
        // this.resetPos.active=true; 
        //         //TODO LATER: make team that scored stay out of circle
    }

    ResetThrowIn(player,PlClass){
    //implement throw in spread random here for opponent
  let randDistX,randDistZ,resultVec,randVec,offset;
  let fieldMax=new THREE.Vector3(98,0,53);
  let fieldMin=new THREE.Vector3(-98,0,-53);
  let throwMax=new THREE.Vector3(91,0,53);
  let throwMin=new THREE.Vector3(-91,0,-53);
  let respawnVec=new THREE.Vector3(this.scene.field.respawnBallLocation.x,0,this.scene.field.respawnBallLocation.z)
  const startPos= new THREE.Vector3(PlClass.StartX,0,PlClass.StartZ);

  
  //console.log(player.name,this.teamName,'randVec',randVec);
// Get randoom Player that is not a goalkeeper to be our thrower and reposition 2 random teammates on each side to be close to the thrower and place the rest in their start position

if(PlClass==this.throwInTaker){
    
    if(respawnVec.z>0){resultVec= new THREE.Vector3(respawnVec.x,0,respawnVec.z-0.3);}
    else if(respawnVec.z<0){resultVec= new THREE.Vector3(respawnVec.x,0,respawnVec.z+0.3);}
  //  console.log("respawnVec:",respawnVec);
  //  console.log(player.name,this.teamName,"resultVec",resultVec);
    this.resetPosition= new YUKA.Vector3(resultVec.x,3,resultVec.z);
    this.resetPos=new YUKA.ArriveBehavior(this.resetPosition,2,0);
    PlClass.yukaPlayer.steering.add(this.resetPos);
    PlClass.stateMachine.changeTo('reset');
    // this.resetPos.active=true; 
}
else if(PlClass.posName=='goalkeeper'){
this.ApplyResetBehavior(PlClass,PlClass.StartX,PlClass.StartZ);
}
else{

    if(this.scene.ball.possessorTeamClass===this){
        if(this.throwInreceivers.includes(PlClass)){        
          randDistX=Math.random()*(30-10)+10;
          randDistZ=Math.random()*(15-10)+10;

          if(respawnVec.z>0){
            randVec= new THREE.Vector3(
                THREE.MathUtils.randFloat(respawnVec.x-randDistX, respawnVec.x+randDistX),
                THREE.MathUtils.randFloat(fieldMin.y, fieldMax.y),
                THREE.MathUtils.randFloat(respawnVec.z-randDistZ, respawnVec.z)
                )
            } 
      else if(respawnVec.z<0){
            randVec= new THREE.Vector3(
                THREE.MathUtils.randFloat(respawnVec.x-randDistX, respawnVec.x+randDistX),
                THREE.MathUtils.randFloat(fieldMin.y, fieldMax.y),
                THREE.MathUtils.randFloat(respawnVec.z, respawnVec.z+randDistZ)
                )
            }

        //  console.log(player.name,this.teamName,'randDistX,randDistZ',randDistX,randDistZ);
          //console.log(player.name,this.teamName,"randVec",randVec);
          resultVec=randVec.clamp(fieldMin,fieldMax);
       //   console.log(player.name,this.teamName,"resultVec",resultVec);
          this.ApplyResetBehavior(PlClass,resultVec.x,resultVec.z);   
          }
        else{
            randDistZ=5;

          if(PlClass.posName=='defender'){  
            offset=Math.random()*(50-35)+35
           randDistX= respawnVec.x - (this.xDirection*-offset);

          }
          else if(PlClass.posName=='midfielder'){
            offset=Math.random()*(30-(-20))-20
           randDistX=respawnVec.x - (this.xDirection*-offset)
          }
         else if(PlClass.posName=='forward'){
            offset=Math.random()*(10-(-10))-10
            randDistX=respawnVec.x - (this.xDirection*-offset)
         }

         if(respawnVec.z>0){
               randVec= new THREE.Vector3(
                   randDistX,
                   0,
                   THREE.MathUtils.randFloat(PlClass.StartZ-randDistZ, PlClass.StartZ+randDistZ)
                   )
               } 
         else if(respawnVec.z<0){
               randVec= new THREE.Vector3(
                randDistX,
                0,
                THREE.MathUtils.randFloat(PlClass.StartZ+randDistZ, PlClass.StartZ-randDistZ)
            )
               }



          // console.log(player.name,this.teamName,'offset,randDistZ',offset,randDistZ);
          // console.log(player.name,this.teamName,"randVec",randVec);
           if(PlClass.posName=='defender'||PlClass.posName=='forward'){
            resultVec=randVec.clamp(throwMin,throwMax);
           }
           else{
            resultVec=randVec.clamp(fieldMin,fieldMax);
              }
          // console.log(player.name,this.teamName,"resultVec",resultVec);
           this.ApplyResetBehavior(PlClass,resultVec.x,resultVec.z); 
           
         }
 }   
 else{
         if(this.throwInreceivers.includes(PlClass)){   
           randDistX=Math.random()*(35-20)+20;
           randDistZ=Math.random()*(30-20)+20;
 
           if(respawnVec.z>0){
             randVec= new THREE.Vector3(
                 THREE.MathUtils.randFloat(respawnVec.x-randDistX, respawnVec.x+randDistX),
                 THREE.MathUtils.randFloat(fieldMin.y, fieldMax.y),
                 THREE.MathUtils.randFloat(respawnVec.z-randDistZ, respawnVec.z)
                 )
             } 
           else if(respawnVec.z<0){
             randVec= new THREE.Vector3(
                 THREE.MathUtils.randFloat(respawnVec.x-randDistX, respawnVec.x+randDistX),
                 THREE.MathUtils.randFloat(fieldMin.y, fieldMax.y),
                 THREE.MathUtils.randFloat(respawnVec.z, respawnVec.z+randDistZ)
                 )
             }
 
          // console.log(player.name,this.teamName,'randDistX,randDistZ',randDistX,randDistZ);
          // console.log(player.name,this.teamName,"randVec",randVec);
           resultVec=randVec.clamp(fieldMin,fieldMax);
         //  console.log(player.name,this.teamName,"resultVec",resultVec);
           this.ApplyResetBehavior(PlClass,resultVec.x,resultVec.z); 
           }
         else{
            randDistZ=5;

            if(PlClass.posName=='defender'){  
                offset=Math.random()*(60-40)+40
               randDistX= respawnVec.x - (this.xDirection*-offset);
    
              }
              else if(PlClass.posName=='midfielder'){
                offset=Math.random()*(10-(-10))-10
               randDistX=respawnVec.x - (this.xDirection*offset)
              }
             else if(PlClass.posName=='forward'){
                offset=Math.random()*(0-(-20))-20
                randDistX=respawnVec.x - (this.xDirection*offset)
             }

         if(respawnVec.z>0){
               randVec= new THREE.Vector3(
                   randDistX,
                   0,
                   THREE.MathUtils.randFloat(PlClass.StartZ-randDistZ, PlClass.StartZ+randDistZ)
                   )
               } 
         else if(respawnVec.z<0){
               randVec= new THREE.Vector3(
                randDistX,
                0,
                THREE.MathUtils.randFloat(PlClass.StartZ+randDistZ, PlClass.StartZ-randDistZ)
            )
               }



          // console.log(player.name,this.teamName,'offset,randDistZ',offset,randDistZ);
          // console.log(player.name,this.teamName,"randVec",randVec);
           if(PlClass.posName=='defender'||PlClass.posName=='forward'){
            resultVec=randVec.clamp(throwMin,throwMax);
           }
           else{
            resultVec=randVec.clamp(fieldMin,fieldMax);
              }
          // console.log(player.name,this.teamName,"resultVec",resultVec);
           this.ApplyResetBehavior(PlClass,resultVec.x,resultVec.z); 
           
         }
      
 }

}
 }

    ResetGoalKick(player,PlClass){

        // Use initial half start positions but put them in an x offset respect to the position of the goal kick position then spawn the ball
        let offset=0;
        let respawnVec=new THREE.Vector3(this.scene.field.respawnBallLocation.x,0,this.scene.field.respawnBallLocation.z)

        if(PlClass.posName=='goalkeeper'){
            if(this.goalKickTaker==PlClass){
                this.ApplyResetBehavior(PlClass,PlClass.StartX,respawnVec.z); 
            }
            else{
                this.ApplyResetBehavior(PlClass,PlClass.StartX,PlClass.StartZ); 
            }

       
        }
        else{
        if(this.scene.ball.possessorTeamClass===this){
            if(PlClass.posName=='defender'){
                offset=15;
                let xPos= PlClass.StartX - (this.xDirection*offset);
                this.ApplyResetBehavior(PlClass,xPos,PlClass.StartZ);
         
            }

            else if(PlClass.posName=='midfielder'){
                offset=30;
            let xPos= PlClass.StartX - (this.xDirection*offset);
            this.ApplyResetBehavior(PlClass,xPos,PlClass.StartZ);
     
            }
            else if(PlClass.posName=='forward'){
                offset=35;
                let xPos= PlClass.StartX - (this.xDirection*offset);
                this.ApplyResetBehavior(PlClass,xPos,PlClass.StartZ);

            }
            
        }
        else{
            if(PlClass.posName=='defender'){
                offset=10;
                let xPos= PlClass.StartX - (this.xDirection*offset);
                this.ApplyResetBehavior(PlClass,xPos,PlClass.StartZ);    
        
            }

            else if(PlClass.posName=='midfielder'){
                offset=30;
            let xPos= PlClass.StartX - (this.xDirection*offset);
            this.ApplyResetBehavior(PlClass,xPos,PlClass.StartZ);    
      

            }
            else if(PlClass.posName=='forward'){
                offset=20;
                let xPos= Math.abs(PlClass.StartX) - (this.xDirection*offset);
                this.ApplyResetBehavior(PlClass,xPos,PlClass.StartZ);
                
            }
        }
    }
    }

    ResetCornerKick(player,PlClass){

        let posVec;
        let respawnVec=new THREE.Vector3(this.scene.field.respawnBallLocation.x,0,this.scene.field.respawnBallLocation.z);
        let selectedPosition;
        const cornerPositions=['inside','around','outside'];

        if(this.insideBoxPlayersList.includes(PlClass)){
            posVec= this.CheckCKBoxPos('inside');
            this.resetPosition= new YUKA.Vector3(posVec.x,3,posVec.z);
            this.resetPos=new YUKA.ArriveBehavior(this.resetPosition,3,1);
            PlClass.yukaPlayer.steering.add(this.resetPos);
            PlClass.stateMachine.changeTo('reset');
            // this.resetPos.active=true;        
             }
        else if(PlClass==this.cornerTaker){
            if(respawnVec.z>0){posVec= new THREE.Vector3(respawnVec.x,0,respawnVec.z+5);}
            else if(respawnVec.z<0){posVec= new THREE.Vector3(respawnVec.x,0,respawnVec.z-5);}
          //  console.log("respawnVec:",respawnVec);
          //  console.log(player.name,this.teamName,"resultVec",posVec);
             this.resetPosition= new YUKA.Vector3(posVec.x,3,posVec.z)
            this.resetPos=new YUKA.ArriveBehavior(this.resetPosition,2,0);
            PlClass.yukaPlayer.steering.add(this.resetPos);
            PlClass.stateMachine.changeTo('reset');
            // this.resetPos.active=true; 
                    }
        else if(PlClass.posName=='goalkeeper'){
            this.resetPosition= new YUKA.Vector3(PlClass.StartX,3,PlClass.StartZ);
            this.resetPos=new YUKA.ArriveBehavior(this.resetPosition,3,1);
            PlClass.yukaPlayer.steering.add(this.resetPos);
            PlClass.stateMachine.changeTo('reset');
            // this.resetPos.active=true; 
                    }
        else{
            if(this.scene.ball.possessorTeamClass===this){
                if(PlClass.posName=='defender'){
                    const weights=[3,2,5];
                    posVec= this.ApplyCornerKickBehavior(PlClass, cornerPositions, weights);
                  
                }

                else if(PlClass.posName=='midfielder'){
                    const weights=[3,4,3];
                    posVec= this.ApplyCornerKickBehavior(PlClass, cornerPositions, weights);
                   
                    }
               
                
                else if(PlClass.posName=='forward'){
                    const weights=[6,1,3];
                    posVec= this.ApplyCornerKickBehavior(PlClass, cornerPositions, weights);
                 
                }
              
            }   
        
        else{
            if(PlClass.posName=='defender'){
                const weights=[8,1,1];
                posVec= this.ApplyCornerKickBehavior(PlClass, cornerPositions, weights);
              
            }
            else if(PlClass.posName=='midfielder'){
                const weights=[4,3,3];
                posVec= this.ApplyCornerKickBehavior(PlClass, cornerPositions, weights);
              
            }
            else if(PlClass.posName=='forward'){
                const weights=[1,1,8];
                posVec= this.ApplyCornerKickBehavior(PlClass, cornerPositions, weights);
              
            }
       
        }
     //    console.log(player.name,PlClass.posName,this.teamName,posVec);

        }
       
    }

    ApplyResetBehavior(PlClass,xPos,zPos){
        this.resetPosition= new YUKA.Vector3(xPos,3,zPos);
        this.resetPos=new YUKA.ArriveBehavior(this.resetPosition,3,1);
        PlClass.yukaPlayer.steering.add(this.resetPos);
        PlClass.stateMachine.changeTo('reset');
        // this.resetPos.active=true;    
         }

    ApplyCornerKickBehavior(PlClass, cornerPositions, weights) {
        const selectedPosition = this.PickCKBoxPos(cornerPositions, weights);
        // console.log(player.name, this.teamName, selectedPosition);
        const posVec = this.CheckCKBoxPos(selectedPosition);
        this.resetPosition = new YUKA.Vector3(posVec.x, 3, posVec.z);
        this.resetPos = new YUKA.ArriveBehavior(this.resetPosition, 3, 1);
        PlClass.yukaPlayer.steering.add(this.resetPos);
        PlClass.stateMachine.changeTo('reset');
        // this.resetPos.active=true; 
        return posVec;
    }

    PickCKBoxPos(arr,weights){
        const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
        const cumulativeWeights = weights.map((weight, index) => 
            weights.slice(0, index + 1).reduce((acc, w) => acc + w, 0)
        );
        const random = Math.random() * totalWeight;
        const index = cumulativeWeights.findIndex(weight => random < weight);
        return arr[index];
    }

    PickCKBoxPosMulti(arr,weights,count){
        let arrCopy = [...arr];
        let weightsCopy = [...weights];
        const pickedElementsWithIndex = []; // Array to store picked elements with their indices
        const usedIndices = new Set(); // Track indices already used

        const pickedElements = Array.from({ length: count }, () => {
            //console.log('arrCopy:',arrCopy);
            //console.log('weightsCopy:',weightsCopy);

            const pickedElement = this.PickCKBoxPos(arrCopy, weightsCopy);
    
            // Find the index of the picked element in arrCopy
            const arrIndex = arrCopy.indexOf(pickedElement);
            
            const originalIndices = arr
            .map((el, index) => (el === pickedElement ? index : -1))
            .filter(index => index !== -1); // Get all indices of this element in the original array

        const availableIndex = originalIndices.find(index => !usedIndices.has(index)); // Pick the first unused index
        usedIndices.add(availableIndex); // Mark this index as used

            pickedElementsWithIndex.push({ element: pickedElement, index:  availableIndex });
    
            // Remove the picked element from arrCopy and weightsCopy using the correct index
            arrCopy.splice(arrIndex, 1);
            weightsCopy.splice(arrIndex, 1);

        return pickedElement;
        });
        return pickedElementsWithIndex;

    }
    
    DetermineInsideBoxPlayers(team, cornerTaker, mininsideBoxNum, weightsMapping) {
        // Get players eligible to be inside the box
        const insideBoxCandidates = Object.values(team.teamList).filter(
            pl => pl.posName !== 'goalkeeper' && pl !== cornerTaker
        );
    
       // console.log(team.teamName, 'MinInsideBoxNum:', mininsideBoxNum);
       // console.log(team.teamName, 'insideBoxCandidates:', insideBoxCandidates);
    
        // Map weights based on position
        const insideBoxPlayersPos = insideBoxCandidates.map(pl => pl.posName);
        const insideBoxWeights = insideBoxPlayersPos.map(posName => weightsMapping[posName] || 0);
    
        // Pick players for inside the box
        const insideBoxPlayers = team.PickCKBoxPosMulti(insideBoxPlayersPos, insideBoxWeights, mininsideBoxNum);
    
      //  console.log(team.teamName, 'InsideBoxPlayers:', insideBoxPlayers);
    
        // Map indices to players
        const insideBoxIndexes = insideBoxPlayers.map(i => i.index);
        const insideBoxPlayersList = insideBoxIndexes.map(index => insideBoxCandidates[index]);
    
       // console.log(team.teamName, 'InsideBoxPlayersList:', insideBoxPlayersList);
    
        return insideBoxPlayersList;
    }

    CheckCKBoxPos(position){
    let posVec;   
    let fieldMax=new THREE.Vector3(98,0,53);
  let fieldMin=new THREE.Vector3(-98,0,-53);
    if(position=='inside'){
    fieldMax.x=91;
    fieldMin.x=-91;    
    posVec=this.InsideBox(fieldMin,fieldMax);
    }
    else if(position=='around'){
    posVec=this.AroundBox(fieldMin,fieldMax);
    }
    else if(position=='outside'){
    posVec=this.OutsideBox(fieldMin,fieldMax);
    }
    return posVec;
    }

    InsideBox(fieldMin,fieldMax){
        let PB,PBox;
        if(this.scene.ball.possessorTeamClass===this){
            PB=this.opponent.PenaltyBox;
            PBox=this.opponent.PenaltyBox.userData.Box;
        }
        else{
             PB=this.PenaltyBox;
             PBox=this.PenaltyBox.userData.Box;
        }

        const randX = THREE.MathUtils.randFloat(PBox.min.x, PBox.max.x);
        const randY = THREE.MathUtils.randFloat(PBox.min.y, PBox.max.y);
        const randZ = THREE.MathUtils.randFloat(PBox.min.z, PBox.max.z);

        const randVec= new THREE.Vector3(randX,randY,randZ);
        const cRandVec= randVec.clamp(fieldMin,fieldMax);
      //  console.log("PBox",PB);
     //  console.log('calculating Inside Vector...')
        return cRandVec;
    }

    OutsideBox(fieldMin,fieldMax){
        let PB,PBox,randX,randY,randZ,randVec,t;
        if(this.scene.ball.possessorTeamClass===this){
            PB=this.opponent.PenaltyBox;
            PBox=this.opponent.PenaltyBox.userData.Box;
            t=0;
        }
        else{
             PB=this.PenaltyBox;
             PBox=this.PenaltyBox.userData.Box;
        }
       //get the rand vec that is between the penalty box and center line and clamp it within field boundaries

       if (this.scene.ball.possessorTeamClass !== this) {
        if (PB.name === 'goal-box-1') {
            t = PBox.max.x / 2;
        } else if (PB.name === 'goal-box-2') {
            t = PBox.min.x / 2; 
        }
    }
        if(PB.name=='goal-box-1'){
            randX = THREE.MathUtils.randFloat(PBox.max.x, t);
            randY = THREE.MathUtils.randFloat(PBox.max.y, 0);
            randZ = THREE.MathUtils.randFloat(fieldMax.z, fieldMin.z);
        }
        else if(PB.name=='goal-box-2'){
            randX = THREE.MathUtils.randFloat(t,PBox.min.x);
            randY = THREE.MathUtils.randFloat(0,PBox.min.y);
            randZ = THREE.MathUtils.randFloat(fieldMax.z, fieldMin.z);
        }
         randVec= new THREE.Vector3(randX,randY,randZ);
        const cRandVec= randVec.clamp(fieldMin,fieldMax);
      //  console.log("PBox",PB.name);
     //   console.log('calculating Outside Vector...');
        return cRandVec;

    }

    AroundBox(fieldMin,fieldMax){
        let PB,PBox,randX,randY,randZ,randVec,t;
        if(this.scene.ball.possessorTeamClass===this){
            PB=this.opponent.PenaltyBox;
            PBox=this.opponent.PenaltyBox.userData.Box;
        }
        else{
             PB=this.PenaltyBox;
             PBox=this.PenaltyBox.userData.Box;
        }
      if (PB.name === 'goal-box-1') {
        t = (this.scene.ball.possessorTeamClass === this)
            ? PBox.max.x / 2
            : PBox.max.x * 0.75;
    } else if (PB.name === 'goal-box-2') {
        t = (this.scene.ball.possessorTeamClass === this)
            ? PBox.min.x / 2
            : PBox.min.x * 0.75;
    }

        if(PB.name=='goal-box-1'){
            do{
                randX=THREE.MathUtils.randFloat(PBox.min.x, t);
                randY=THREE.MathUtils.randFloat(PBox.min.y, 0);
                randZ=THREE.MathUtils.randFloat(fieldMax.z, fieldMin.z);
                randVec= new THREE.Vector3(randX,randY,randZ);
            }while(PBox.containsPoint(randVec));
        }
        else if(PB.name=='goal-box-2'){
            do{
                randX=THREE.MathUtils.randFloat(t,PBox.max.x);
                randY=THREE.MathUtils.randFloat(0,PBox.max.y);
                randZ=THREE.MathUtils.randFloat(fieldMax.z, fieldMin.z);
                randVec= new THREE.Vector3(randX,randY,randZ);

            }while(PBox.containsPoint(randVec));
        }
        const cRandVec= randVec.clamp(fieldMin,fieldMax);
     //   console.log("PBox",PB);
   //     console.log('calculating Around Vector...')
        return cRandVec;
    }

    Pickrandom(arr){
        // random pick 2 elements here
            //if there are 2 or less players left choose only one to be the receiver else 2 receivers use PickRandom func
            //use this.throwInreceivers as variable
    let firstIndex=Math.floor(Math.random()*arr.length);
    if(arr.length>2){
     let secondIndex;
     do{
        secondIndex = Math.floor(Math.random() * arr.length);
     }while(secondIndex===firstIndex);
     this.throwInreceivers=[arr[firstIndex],arr[secondIndex]];
    }
    else{
     this.throwInreceivers=[arr[firstIndex]];
    }
   //  console.log(this.teamName,"Throw In receivers",this.throwInreceivers);   
    }

    _update(){

    
            this.teamList?.GK?._update(this.scene);
            this.teamList?.PL1?._update(this.scene);
            this.teamList?.PL2?._update(this.scene); 
            this.teamList?.PL3?._update(this.scene);
            this.teamList?.PL4?._update(this.scene);
            this.teamList?.PL5?._update(this.scene);
            this.teamList?.PL6?._update(this.scene); 
            this.teamList?.PL7?._update(this.scene);
            this.teamList?.PL8?._update(this.scene);
            this.teamList?.PL9?._update(this.scene); 
            this.teamList?.PL10?._update(this.scene);

            this._teamTrack();
            this._teamPostTrack();
            this._targetOffsideLine();
            this._checkKicking();
            if(this.scene.halfTimeCompleted==false && this.scene.halfTimeCalled!=1){
                this.CheckPlayers('HalfTime');
              //  console.log("checking half...")

            }
           else if(!this.scene.isClockRun && this.scene.eventName!=null&& this.scene.eName!=undefined && !(this.scene.Team1.check && this.scene.Team2.check)){
                this.CheckPlayers(this.scene.eName);
               //  console.log("checking event...")
            }   
                

    }
   

    _setAddManager(entityManager){
        this.teamList?.GK?._setAddManager(entityManager);
        this.teamList?.PL1?._setAddManager(entityManager);
        this.teamList?.PL2?._setAddManager(entityManager); 
        this.teamList?.PL3?._setAddManager(entityManager);
        this.teamList?.PL4?._setAddManager(entityManager);
        this.teamList?.PL5?._setAddManager(entityManager);
        this.teamList?.PL6?._setAddManager(entityManager); 
        this.teamList?.PL7?._setAddManager(entityManager);
        this.teamList?.PL8?._setAddManager(entityManager);
        this.teamList?.PL9?._setAddManager(entityManager); 
        this.teamList?.PL10?._setAddManager(entityManager);
    }

    _addPlayerSteeringBehaviors(behavior,steeringType){

        Object.keys(this.teamList).forEach((key) => {
            if(_.has(this.teamList, key) && this.teamList[key].posName !== 'goalkeeper'){           
              //   console.log(this.teamList[key]);
                 
                 let newBehavior = null;
 
                 if (steeringType === 'seek') {
                    newBehavior = new YUKA.SeekBehavior(new YUKA.Vector3(
                        behavior.target.x, behavior.target.y, behavior.target.z
                    ));
                }
                else if (steeringType === 'pursue') {
                    newBehavior = new YUKA.PursuitBehavior(behavior.evader, behavior.predictionFactor);
                } 
                else if (steeringType === 'avoidPlayers' || steeringType === 'avoidBall') {
                    newBehavior = new YUKA.ObstacleAvoidanceBehavior([...behavior.obstacles]);
                    newBehavior.dBoxMinLength = behavior.dBoxMinLength;
                } 
                else if (steeringType === 'arrive') {
                    newBehavior = new YUKA.ArriveBehavior(new YUKA.Vector3(
                        behavior.target.x, behavior.target.y, behavior.target.z
                    ), behavior.deceleration, behavior.tolerance);
                }
            newBehavior.weight = behavior.weight;
            this.teamList[key].yukaPlayer.steering.add(newBehavior);
        //   console.log(this.teamList[key].yukaPlayer.steering.behaviors);
            }
            
    
        });
    }

   

    _addKeeperSteeringBehaviors(behavior,steeringType){
     //  console.log(this.teamList?.GK);
        let newBehavior = null;
        if(steeringType === 'avoidPlayers'){
            newBehavior = new YUKA.ObstacleAvoidanceBehavior([...behavior.obstacles]);
            newBehavior.dBoxMinLength = behavior.dBoxMinLength;
        }
        else if(steeringType === 'tendPost'){
            newBehavior = new YUKA.ArriveBehavior(new YUKA.Vector3(
                behavior.target.x, behavior.target.y, behavior.target.z
            ), behavior.deceleration, behavior.tolerance);
        }
        newBehavior.weight = behavior.weight;
        this.teamList?.GK?.yukaPlayer.steering.add(newBehavior);
      //  console.log(this.teamList?.GK?.yukaPlayer.steering.behaviors);
    }

    RemoveBehavior(behavior){
        this.teamList?.GK?.yukaPlayer.steering.remove(behavior);
        this.teamList?.PL1?.yukaPlayer.steering.remove(behavior);
        this.teamList?.PL2?.yukaPlayer.steering.remove(behavior); 
        this.teamList?.PL3?.yukaPlayer.steering.remove(behavior);
        this.teamList?.PL4?.yukaPlayer.steering.remove(behavior);
        this.teamList?.PL5?.yukaPlayer.steering.remove(behavior);
        this.teamList?.PL6?.yukaPlayer.steering.remove(behavior); 
        this.teamList?.PL7?.yukaPlayer.steering.remove(behavior);
        this.teamList?.PL8?.yukaPlayer.steering.remove(behavior);
        this.teamList?.PL9?.yukaPlayer.steering.remove(behavior); 
        this.teamList?.PL10?.yukaPlayer.steering.remove(behavior);
        
        this.resetPos=null;
    }

    _checkKicking(){
      //  if(this.teamName=='Swans'){
          //  console.log(this.teamList?.GK);      
         //   console.log(this.teamName,"yuka steer",this.teamList.PL3.ResetDone);  
          //  console.log(this.teamName,"yuka steer",this.teamList.PL1.StartX,this.teamList.PL1.player);  
          //  console.log(this.teamName,"OFSL dist",this.OFSLposx);  
         //   console.log(this.teamName,"POST USRDT dist",this.teamList?.PL2?.player?.userData?.distPost);  
         //   console.log(this.teamName,"Ball dist",this.teamDistBall);  
        //  console.log(`${this.teamName} DotP distance ${this.teamList?.GK?.player?.userData.dotP}`);  
     //  }
           
    }

    _addObstacle(obstacle){
        obstacle.push(
            this.teamList?.GK?.yukaObstacle,
            this.teamList?.PL1?.yukaObstacle,
            this.teamList?.PL2?.yukaObstacle, 
            this.teamList?.PL3?.yukaObstacle,
            this.teamList?.PL4?.yukaObstacle,
            this.teamList?.PL5?.yukaObstacle,
            this.teamList?.PL6?.yukaObstacle, 
            this.teamList?.PL7?.yukaObstacle,
            this.teamList?.PL8?.yukaObstacle,
            this.teamList?.PL9?.yukaObstacle, 
            this.teamList?.PL10?.yukaObstacle,  
        )

       return obstacle.filter(ob =>ob != undefined);
    }

  
}