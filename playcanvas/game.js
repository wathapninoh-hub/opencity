/* Madagascar Driving Simulator - first PlayCanvas conversion prototype.
   Rebuilds the Godot greybox driving idea with PlayCanvas primitives.
   This is a web prototype, not yet a complete Truckers of Europe 3-style game. */
(() => {
  const canvas = document.getElementById('game');
  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    keyboard: new pc.Keyboard(window),
    graphicsDeviceOptions: { alpha: false, antialias: true, deviceTypes: ['webgl2','webgl1'] }
  });
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  app.scene.ambientLight = new pc.Color(0.55,0.55,0.55);
  app.scene.exposure = 1.15;

  const mat = (r,g,b) => { const m = new pc.StandardMaterial(); m.diffuse = new pc.Color(r,g,b); m.update(); return m; };
  const materials = {
    dirt: mat(0.48,0.22,0.09), road: mat(0.16,0.17,0.18), line: mat(0.92,0.82,0.55),
    grass: mat(0.28,0.43,0.18), leaf: mat(0.12,0.35,0.12), wood: mat(0.43,0.25,0.12),
    wall: mat(0.72,0.53,0.32), roof: mat(0.34,0.17,0.10), truck: mat(0.78,0.17,0.10),
    glass: mat(0.16,0.30,0.36), tire: mat(0.035,0.04,0.045), metal: mat(0.65,0.67,0.68)
  };
  function box(name, position, scale, material, parent=app.root) {
    const e = new pc.Entity(name); e.addComponent('render',{type:'box',material});
    e.setLocalPosition(position[0],position[1],position[2]); e.setLocalScale(scale[0],scale[1],scale[2]); parent.addChild(e); return e;
  }
  function cylinder(name, position, scale, material, parent=app.root) {
    const e = new pc.Entity(name); e.addComponent('render',{type:'cylinder',material});
    e.setLocalPosition(position[0],position[1],position[2]); e.setLocalScale(scale[0],scale[1],scale[2]); parent.addChild(e); return e;
  }
  // Madagascar-inspired rural scene: red earth, village houses, palms and a long road.
  box('Red earth',[0,-0.35,0],[260,0.5,260],materials.dirt);
  box('Road',[0,-0.06,0],[10,0.12,240],materials.road);
  for(let z=-112;z<120;z+=12) box('Road marking',[0,0.01,z],[0.16,0.025,5],materials.line);
  for(let side of [-1,1]) {
    box('Road shoulder',[side*6,-0.02,0],[2,0.12,240],materials.wood);
    for(let z=-100;z<=100;z+=18) {
      box('House wall',[side*13,1.1,z],[5,2.2,6],materials.wall);
      const roof=box('House roof',[side*13,2.55,z],[5.8,0.65,6.8],materials.roof); roof.setLocalEulerAngles(0,0,0);
      box('Door',[side*13,0.65,z-3.04],[0.8,1.3,0.08],materials.wood);
      // Stylized banana/palm-like trees.
      cylinder('Tree trunk',[side*(8+Math.random()*5),1.5,z+7],[0.28,3,0.28],materials.wood);
      for(let a=0;a<5;a++) {
        const leaf=box('Leaf',[side*(8+Math.random()*5),3.2,z+7],[0.22,0.12,2.4],materials.leaf);
        leaf.setLocalEulerAngles(0,a*72,25);
      }
    }
  }
  // Simple truck body and cabin, created as editable entities.
  const truck = new pc.Entity('Player truck'); app.root.addChild(truck);
  box('Chassis',[0,1.05,0],[2.25,0.55,4.7],materials.truck,truck);
  box('Cabin',[0,1.95,-1.15],[2.1,1.35,1.65],materials.truck,truck);
  box('Windshield',[0,2.12,-2.0],[1.75,0.85,0.06],materials.glass,truck);
  box('Cargo',[0,2.0,1.1],[2.15,1.35,2.4],materials.metal,truck);
  const wheels=[];
  for(const x of [-1.18,1.18]) for(const z of [-1.55,1.55]) {
    const w=cylinder('Wheel',[x,0.62,z],[0.55,0.28,0.55],materials.tire,truck);
    w.setLocalEulerAngles(0,0,90); wheels.push(w);
  }
  truck.setPosition(0,0,10);

  // Camera follows behind the truck.
  const camera = new pc.Entity('Camera'); camera.addComponent('camera',{clearColor:new pc.Color(0.55,0.72,0.86), fov:65, farClip:500});
  app.root.addChild(camera); camera.setPosition(0,7,20); camera.lookAt(0,1,10);
  const sun = new pc.Entity('Sun'); sun.addComponent('light',{type:'directional', color:new pc.Color(1,0.93,0.78), intensity:1.6, castShadows:true});
  sun.setEulerAngles(35,25,0); app.root.addChild(sun);
  const fill = new pc.Entity('Fill light'); fill.addComponent('light',{type:'directional',color:new pc.Color(0.65,0.75,1),intensity:0.35}); fill.setEulerAngles(145,-25,0); app.root.addChild(fill);

  const input={left:false,right:false,gas:false,brake:false};
  const keyMap={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'gas',w:'gas',ArrowDown:'brake',s:'brake', ' ':'brake'};
  window.addEventListener('keydown',e=>{const k=keyMap[e.key];if(k){input[k]=true;e.preventDefault();}});
  window.addEventListener('keyup',e=>{const k=keyMap[e.key];if(k)input[k]=false;});
  document.querySelectorAll('[data-control]').forEach(btn=>{
    const k=btn.dataset.control;
    const down=e=>{e.preventDefault();input[k]=true;};
    const up=e=>{e.preventDefault();input[k]=false;};
    btn.addEventListener('pointerdown',down); btn.addEventListener('pointerup',up);
    btn.addEventListener('pointercancel',up); btn.addEventListener('pointerleave',up);
  });
  let speed=0, heading=0;
  app.on('update',dt=>{
    dt=Math.min(dt,0.04);
    const accelerating=input.gas?1:0, braking=input.brake?1:0;
    speed += accelerating*17*dt; speed -= braking*27*dt; speed -= (accelerating||braking?0:4)*dt;
    speed=Math.max(0,Math.min(speed,38));
    const steer=(input.left?1:0)-(input.right?1:0);
    heading += steer*(0.35+speed*0.025)*dt;
    truck.translate( Math.sin(heading)*speed*dt, 0, -Math.cos(heading)*speed*dt );
    truck.setEulerAngles(0,heading*180/Math.PI,0);
    wheels.forEach(w=>w.rotateLocal(0,0,-speed*dt*90));
    const p=truck.getPosition();
    const desired=new pc.Vec3(p.x+Math.sin(heading)*2, p.y+6.2, p.z+Math.cos(heading)*10);
    camera.setPosition(camera.getPosition().lerp(camera.getPosition(),desired,Math.min(1,dt*4)));
    camera.lookAt(p.x,p.y+1.2,p.z);
    document.getElementById('speed').textContent=Math.round(speed*3.6)+' km/h';
  });
  app.start();
  document.getElementById('loading').classList.add('hidden');
  window.addEventListener('resize',()=>app.resizeCanvas());
})();