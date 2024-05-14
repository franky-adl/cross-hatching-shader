// ThreeJS and Third-party deps
import * as THREE from "three"
import * as dat from 'dat.gui'
import Stats from "three/examples/jsm/libs/stats.module"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// Core boilerplate code deps
import { createCamera, createRenderer, runApp, updateLoadingProgressBar } from "./core-utils"

// Other deps
import testVertex from "./shaders/testVertex.glsl"
import testFragment from "./shaders/testFragment.glsl"

global.THREE = THREE
// previously this feature is .legacyMode = false, see https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
// turning this on has the benefit of doing certain automatic conversions (for hexadecimal and CSS colors from sRGB to linear-sRGB)
THREE.ColorManagement.enabled = true

/**************************************************
 * 0. Tweakable parameters for the scene
 *************************************************/
const params = {
  // general scene params
}


/**************************************************
 * 1. Initialize core threejs components
 *************************************************/
// Create the scene
let scene = new THREE.Scene()

// Create the renderer via 'createRenderer',
// 1st param receives additional WebGLRenderer properties
// 2nd param receives a custom callback to further configure the renderer
let renderer = createRenderer({ antialias: true }, (_renderer) => {
  // best practice: ensure output colorspace is in sRGB, see Color Management documentation:
  // https://threejs.org/docs/#manual/en/introduction/Color-management
  // _renderer.outputColorSpace = THREE.SRGBColorSpace
})

// Create the camera
// Pass in fov, near, far and camera position respectively
let camera = createCamera(50, 1, 10000, { x: 0, y: 0, z: 0 })

/**************************************************
 * 2. Build your scene in this threejs app
 * This app object needs to consist of at least the async initScene() function (it is async so the animate function can wait for initScene() to finish before being called)
 * initScene() is called after a basic threejs environment has been set up, you can add objects/lighting to you scene in initScene()
 * if your app needs to animate things(i.e. not static), include a updateScene(interval, elapsed) function in the app as well
 *************************************************/
let app = {
  async initScene() {
    // OrbitControls
    this.controls = new OrbitControls(camera, renderer.domElement)
    this.controls.enableDamping = true

    await updateLoadingProgressBar(0.1)

    let directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(0, 0, 1)
    scene.add(directionalLight)

    var lineColor1 = 0xff0000
    var lineColor2 = 0x0000ff

    this.material1 = new THREE.ShaderMaterial({
      uniforms: {
        uDirLightPos: {
          type: 'v3',
          value: directionalLight.position
        },
        uDirLightColor: {
          type: 'c',
          value: directionalLight.color
        },
        uAmbientLightColor: {
          type: 'c',
          value: new THREE.Color(0x050505)
        },
        uBaseColor: {
          type: 'c',
          value: new THREE.Color(0x000000)
        },
        uLineColor0: {
          type: 'c',
          value: new THREE.Color(lineColor1)
        },
        uLineColor1: {
          type: 'c',
          value: new THREE.Color(lineColor1)
        },
        uLineColor2: {
          type: 'c',
          value: new THREE.Color(lineColor1)
        },
        uLineColor3: {
          type: 'c',
          value: new THREE.Color(lineColor1)
        },
        uLineColor4: {
          type: 'c',
          value: new THREE.Color(0xffff00)
        }
      },
      vertexShader: testVertex,
      fragmentShader: testFragment
    })

    this.material2 = new THREE.ShaderMaterial({
      uniforms: {
        uDirLightPos: {
          type: 'v3',
          value: directionalLight.position
        },
        uDirLightColor: {
          type: 'c',
          value: directionalLight.color
        },
        uAmbientLightColor: {
          type: 'c',
          value: new THREE.Color(0x050505)
        },
        uBaseColor: {
          type: 'c',
          value: new THREE.Color(0x000000)
        },
        uLineColor0: {
          type: 'c',
          value: new THREE.Color(lineColor2)
        },
        uLineColor1: {
          type: 'c',
          value: new THREE.Color(lineColor2)
        },
        uLineColor2: {
          type: 'c',
          value: new THREE.Color(lineColor2)
        },
        uLineColor3: {
          type: 'c',
          value: new THREE.Color(lineColor2)
        },
        uLineColor4: {
          type: 'c',
          value: new THREE.Color(0x00ffff)
        }
      },
      vertexShader: testVertex,
      fragmentShader: testFragment
    })

    var geometry = new THREE.TorusGeometry(250, 100, 32, 64)

    this.mesh1 = new THREE.Mesh(geometry, this.material1)
    this.mesh1.position.x = -300
    this.mesh1.position.z = -1000
    scene.add(this.mesh1)

    this.mesh2 = new THREE.Mesh(geometry, this.material2)
    this.mesh2.position.x = 300
    this.mesh2.position.z = -1000
    scene.add(this.mesh2)

    // GUI controls
    const gui = new dat.GUI()

    // Stats - show fps
    this.stats1 = new Stats()
    this.stats1.showPanel(0) // Panel 0 = fps
    this.stats1.domElement.style.cssText = "position:absolute;top:0px;left:0px;"
    // this.container is the parent DOM element of the threejs canvas element
    this.container.appendChild(this.stats1.domElement)

    await updateLoadingProgressBar(1.0, 100)
  },
  // @param {number} interval - time elapsed between 2 frames
  // @param {number} elapsed - total time elapsed since app start
  updateScene(interval, elapsed) {
    this.controls.update()
    this.stats1.update()

    this.mesh1.rotation.y += Math.PI / 8 * .025
    this.mesh2.rotation.y -= Math.PI / 8 * .025
  }
}

/**************************************************
 * 3. Run the app
 * 'runApp' will do most of the boilerplate setup code for you:
 * e.g. HTML container, window resize listener, mouse move/touch listener for shader uniforms, THREE.Clock() for animation
 * Executing this line puts everything together and runs the app
 * ps. if you don't use custom shaders, pass undefined to the 'uniforms'(2nd-last) param
 * ps. if you don't use post-processing, pass undefined to the 'composer'(last) param
 *************************************************/
runApp(app, scene, renderer, camera, true)
