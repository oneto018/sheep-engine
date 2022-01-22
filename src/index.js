 import Box2DFactory from 'box2d-wasm';


function delay(time){
    return new Promise((res,rej)=>{
        setTimeout(()=> res(new Date()),time);
    });
}

export async function test1(){
    console.log('first ====> ', new Date());
    const t =  await delay(3000);
    console.log('after 3 seconds',t);
    const t2 = await delay(4000);
    console.log('after 4 s',t2);
}

export async function loadBox2d(){
    const box2d = await Box2DFactory();
    console.log('box2d loaded---->',box2d);
}