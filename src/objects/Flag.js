import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export class Flag{
    constructor(model,flagname){
        this.model=model;
        this.flag=null;
        this.flagname=flagname;
    }

    SetFlags(scene,target,rot,size,offset,shade){
            target.scale.setScalar(size);
            target.rotateY(rot)
            target.traverse(c => {
              c.castShadow = true;
            });
            target.position.copy(offset);
            this.flag= new ExtendedObject3D();
            this.flag.add(target);
            scene.scene.add(this.flag);
            this.flagclone=SkeletonUtils.clone(target);
            this.flag.children[0].children[1].material.color=new THREE.Color(1,0,0);

      }
}