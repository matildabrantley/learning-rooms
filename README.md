# Learning Rooms!
Summary - Train virtual creatures to optimize their survival using Synaptic.js and animate them with Pixi.js.

#### Matilda Brantley
### [Live GitHub Page](https://matildabrantley.github.io/learning-rooms/)
## Features
* Three types of laser pointer motion:
    * Random Motion: Simulates a person controlling the laser pointer. Speed can be adjusted. Uses velocity vector. Reound off sides.
    * Random Jumping: For training networks to prevent local overfitting.
    * User Controlled: For testing the results of training. Or just having fun.
* Six rooms with independent learning rates.
* Checkbox for toggling global active learning on/off.
* Synaptic.js used for neural networks. 
    * Simple 2-5-5-2 Perceptrons for Network Architecture for now. 
* Pixi.js used for graphics (not much for now). 
* Creatures (cats) have velocity and acceleration vectors. Reound off sides.
* Vector2d Class with many methods for controlling simulated 2d motion (distance, add, multiply, dot product, reverse, clamp to limit min/max values, angles).
   
## Features Under Work
   
* Users will be able to set network type and layer size in a jQuery widget.
* Genetic Algorithm to be used for finding good training parameters for each room as well as mutating individual weights in a network.
    * Rooms will be compared side-by-side to test various combinations of learning techniques.
* Animation:
    * Sprite sheets.
    * Filters tied to various conditions in rooms
    * More effects for events in rooms, such as cat collision with laser or with each other.