import {Scene3D,ExtendedObject3D ,THREE } from 'enable3d'
import { MatchScene } from '../core/MatchScene';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export class Flag{
    constructor(model,flagname){
        this.model=model;
        this.post=null;
        this.flagname=flagname;
    }

    SetFlags(scene,target,rot,size,offset){
            target.scale.setScalar(size);
            target.rotateY(rot)
            target.traverse(c => {
              c.castShadow = true;
            });
            target.position.copy(offset);
            scene.scene.add(target);
            this.flagclone=SkeletonUtils.clone(target);
      }
}