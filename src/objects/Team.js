//import Outfield from './Outfield.js';
import {Keeper} from './Keeper.js';
import {Player} from './Player.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
export class Team{
    //future: redefine class and make keepermodel optional
    //future: implement formation in the class
    constructor(teamSize,teamName,playerModel,KeeperModel,goalassignment,shade,rot,size,ball,scene,xDirection){
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
       this.teamList.GK=new Keeper(this.KeeperModel,'Aderinsola Oladaiye',this.ball,this); 
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
        this.teamList.GK=new Keeper(this.KeeperModel,'Aderinsola Oladaiye',this.ball,this); 
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
        this.teamList.GK=new Keeper(this.KeeperModel,'Aderinsola Oladaiye',this.ball,this); 
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

        console.log('5 players spawned')

    }

    _createTeam8v8(){
        this.teamList.GK=new Keeper(this.KeeperModel,'Aderinsola Oladaiye',this.ball,this); 
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
        console.log('8 players spawned')

    }

    _createTeam11v11(){
        this.teamList.GK=new Keeper(this.KeeperModel,'Aderinsola Oladaiye',this.ball,this); 
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

        console.log('11 players spawned')



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

    _halfTimeSwap(){

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
        //    this._checkKicking();         

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

    _addPlayerSteeringBehaviors(behavior){
        this.teamList?.PL1?.yukaPlayer.steering.add(behavior);
        this.teamList?.PL2?.yukaPlayer.steering.add(behavior); 
        this.teamList?.PL3?.yukaPlayer.steering.add(behavior);
        this.teamList?.PL4?.yukaPlayer.steering.add(behavior);
        this.teamList?.PL5?.yukaPlayer.steering.add(behavior);
        this.teamList?.PL6?.yukaPlayer.steering.add(behavior); 
        this.teamList?.PL7?.yukaPlayer.steering.add(behavior);
        this.teamList?.PL8?.yukaPlayer.steering.add(behavior);
        this.teamList?.PL9?.yukaPlayer.steering.add(behavior); 
        this.teamList?.PL10?.yukaPlayer.steering.add(behavior);
    }

   

    _addKeeperSteeringBehaviors(behavior){
        this.teamList?.GK?.yukaPlayer.steering.add(behavior);
    }

    _checkKicking(){
      console.log(`${this.teamName}` ,this.teamList?.GK?.player?.position) 
      console.log(`${this.teamName}` ,this.teamList?.PL2?.yukaPlayer)     
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