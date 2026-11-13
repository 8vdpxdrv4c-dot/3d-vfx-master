export function disposeSpoutResources(state){
 if(!state)return;
 state.scene?.clear();state.geometry?.dispose();state.material?.dispose();state.texture?.dispose();
}
