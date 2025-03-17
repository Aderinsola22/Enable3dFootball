import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

//implement softbody on net later
export class Post{
    constructor(texture,postname){
        this.mtltexture=texture;
        this.post=null;
        this.postname=postname
    }
    _SetPost(scene,target,targX,rotY,rotZ,size,offsetX,offsetY,offsetZ){
        target.scale.setScalar(size);
        this.post = new ExtendedObject3D();

        const goalWall=scene.add.box({width:0.1,height:9,depth:21.5},{basic:{color:'yellow'}});
        goalWall.position.set(targX,4.9,0);
        goalWall.rotateZ(rotZ);

        this.post.add(target);
        this.post.name=this.postname;
        this.post.position.set(offsetX,offsetY,offsetZ);

        this.post.rotateY(rotY);

        scene.scene.add(this.post);

        scene.physics.add.existing(this.post,{shape:'concave',mass:0});
        scene.physics.add.existing(goalWall,{mass:0})

        this.post.body.setCollisionFlags(2);
        this.post.body.ammo.setRestitution(0.5)

        goalWall.body.setCollisionFlags(1);
        goalWall.body.setRestitution(0.05);
 
        goalWall.visible=false;

        this.postclone=SkeletonUtils.clone(target);
    }

    _update(){
       
    }

}