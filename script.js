import * as THREE from 'three';

import { OrbitControls } from 'https://unpkg.com/three@0.120.1/examples/jsm/controls/OrbitControls.js'
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector("#bg"),
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(-52.3, 20, 40.5);
renderer.setClearColor("#ffffff");

function solution(x,y,z, color=0x0000ff) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.dx = (a * (this.y - this.x))*dt;
	this.dy = (this.x * (b - this.z) - this.y)*dt;
	this.dz = ((this.x * this.y) - (c * this.z))*dt;
	this.points = [];
	this.color = color
	this.headgeometry = new THREE.SphereGeometry(0.2);
	this.headmaterial = new THREE.MeshLambertMaterial({ color: 0xffffff});
	this.linegeometry = new THREE.BufferGeometry().setFromPoints(this.points);
	this.linematerial = new THREE.LineBasicMaterial( { color: this.color, linewidth:4} );

	this.head = new THREE.Mesh(this.headgeometry, this.headmaterial)
	scene.add(this.head)
	this.line = new THREE.Line(this.linegeometry, this.linematerial)
	scene.add(this.line)
	
	this.calculate = function() {
		this.x = this.x + this.dx;
		this.y = this.y + this.dy;
		this.z = this.z + this.dz;
		this.dx = (a * (this.y - this.x))*dt;
		this.dy = (this.x * (b - this.z) - this.y)*dt;
		this.dz = ((this.x * this.y) - (c * this.z))*dt;
	}
	this.draw = function() {
		this.head.position.set(this.x,this.y,this.z);
		scene.remove(this.line);
		this.points.push(new THREE.Vector3(this.x,this.y,this.z))
		if (this.points.length>200){
			this.points.shift();
		}
		this.linegeometry = new THREE.BufferGeometry().setFromPoints(this.points);
		this.line = new THREE.Line(this.linegeometry, this.linematerial);
		scene.add(this.line);
	}
}


//	Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 0);
scene.add(light);
const mainlight = new THREE.AmbientLight(0xffffff, 1);
scene.add(mainlight);

//	Helpers
//const lighthelper = new THREE.PointLightHelper(light);
//const gridhelper = new THREE.GridHelper(100, 50);
//scene.add(lighthelper, gridhelper);

const controls = new OrbitControls(camera, document.querySelector("#bg"));
controls.enabled = false;
controls.autoRotate = true;
controls.target.set(0,0,30);

//	ρ = 28, σ = 10, and β = 8/3
const a = 10;
const b = 28;
const c = 8/3;

let dt = 0.005;//time

let solutions = []

solutions.push(new solution(1,0,0, 0x0000ff))
solutions.push(new solution(1.00001,0,0,0x0000ff))
solutions.push(new solution(1.00002,0,0,0x0000ff))
solutions.push(new solution(1.00003,0,0, 0x0000ff))
solutions.push(new solution(1.00004,0,0,0x0000ff))
solutions.push(new solution(1.00005,0,0,0x0000ff))
solutions.push(new solution(0,1,50, 0x0000ff))
solutions.push(new solution(0,1,50.00001,0x0000ff))
solutions.push(new solution(0,1,50.00002,0x0000ff))
solutions.push(new solution(0,1,50.00003, 0x0000ff))
solutions.push(new solution(0,1,50.00004,0x00000ff))
solutions.push(new solution(0,1,50.00005,0x0000ff))

function animate() {	
	requestAnimationFrame(animate);
	controls.autoRotateSpeed = 0.5;	
	for (let i = 0;i<solutions.length;i++){
		solutions[i].calculate()
		solutions[i].draw()
	}
	controls.update();
	renderer.render(scene, camera);
}
animate();
