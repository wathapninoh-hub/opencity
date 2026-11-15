extends Node3D
## Lightweight Madagascar-inspired village dressing for the OpenCity prototype.
## All meshes are generated at runtime; no external assets are required.

const WORLD_HALF := 161.0
const RIVER_Z := 128.0
const RIVER_WIDTH := 9.0
var rng := RandomNumberGenerator.new()

func _ready() -> void:
	rng.seed = 20261115
	_build_red_dirt_track()
	_build_river()
	_build_bank_stones()
	_build_banana_groves()
	_build_village_houses()

func _material(colour: Color, roughness := 0.92) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = colour
	mat.roughness = roughness
	return mat

func _box(parent: Node3D, pos: Vector3, size: Vector3, mat: Material, rotation_y := 0.0) -> void:
	var mesh_instance := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	mesh_instance.mesh = mesh
	mesh_instance.material_override = mat
	mesh_instance.position = pos
	mesh_instance.rotation.y = rotation_y
	parent.add_child(mesh_instance)

func _build_red_dirt_track() -> void:
	var track := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(300.0, 8.0)
	track.mesh = plane
	track.position = Vector3(0.0, 0.035, 112.0)
	track.material_override = _material(Color(0.48, 0.22, 0.10))
	add_child(track)

	# Uneven shoulders make the track read as a rural red-earth road.
	for side in [-1.0, 1.0]:
		for i in range(30):
			var x := -145.0 + float(i) * 10.0
			var shoulder := MeshInstance3D.new()
			var shoulder_mesh := BoxMesh.new()
			shoulder_mesh.size = Vector3(rng.randf_range(4.0, 9.0), 0.12, rng.randf_range(1.5, 3.0))
			shoulder.mesh = shoulder_mesh
			shoulder.position = Vector3(x, 0.02, 112.0 + side * rng.randf_range(5.0, 7.0))
			shoulder.material_override = _material(Color(0.40, 0.18, 0.08))
			add_child(shoulder)

func _build_river() -> void:
	var water := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(310.0, RIVER_WIDTH)
	water.mesh = plane
	water.position = Vector3(0.0, 0.12, RIVER_Z)
	var water_mat := StandardMaterial3D.new()
	water_mat.albedo_color = Color(0.10, 0.48, 0.58, 0.88)
	water_mat.roughness = 0.22
	water_mat.metallic = 0.08
	water_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	water.material_override = water_mat
	add_child(water)

func _build_bank_stones() -> void:
	var stone_mat := _material(Color(0.34, 0.32, 0.29))
	for side in [-1.0, 1.0]:
		for i in range(48):
			var stone := MeshInstance3D.new()
			var sphere := SphereMesh.new()
			sphere.radius = rng.randf_range(0.35, 0.9)
			sphere.height = sphere.radius * 1.1
			stone.mesh = sphere
			stone.position = Vector3(-150.0 + float(i) * 6.3, 0.25, RIVER_Z + side * rng.randf_range(5.0, 7.0))
			stone.scale = Vector3(1.4, 0.55, 0.9)
			stone.material_override = stone_mat
			add_child(stone)

func _build_banana_groves() -> void:
	for side in [-1.0, 1.0]:
		for i in range(24):
			var x := -145.0 + float(i) * 12.0 + rng.randf_range(-2.0, 2.0)
			var z := RIVER_Z + side * rng.randf_range(11.0, 20.0)
			_add_banana_plant(Vector3(x, 0.0, z))

func _add_banana_plant(origin: Vector3) -> void:
	var trunk := MeshInstance3D.new()
	var cylinder := CylinderMesh.new()
	cylinder.top_radius = 0.22
	cylinder.bottom_radius = 0.34
	cylinder.height = 3.6
	trunk.mesh = cylinder
	trunk.position = origin + Vector3(0.0, 1.8, 0.0)
	trunk.material_override = _material(Color(0.36, 0.48, 0.19))
	add_child(trunk)

	var leaf_mat := _material(Color(0.16, 0.38 + rng.randf() * 0.12, 0.08))
	for leaf_index in range(7):
		var angle := TAU * float(leaf_index) / 7.0
		var leaf := MeshInstance3D.new()
		var leaf_mesh := SphereMesh.new()
		leaf_mesh.radius = 1.0
		leaf_mesh.height = 2.0
		leaf.mesh = leaf_mesh
		leaf.position = origin + Vector3(cos(angle) * 1.0, 3.55, sin(angle) * 1.0)
		leaf.scale = Vector3(0.42, 1.9, 0.85)
		leaf.rotation = Vector3(0.0, -angle, cos(angle) * 0.45)
		leaf.material_override = leaf_mat
		add_child(leaf)

func _build_village_houses() -> void:
	var wall_mat := _material(Color(0.62, 0.39, 0.22))
	var roof_mat := _material(Color(0.28, 0.13, 0.08))
	for i in range(6):
		var x := -105.0 + float(i) * 42.0
		var z := 91.0 if i % 2 == 0 else 151.0
		_box(self, Vector3(x, 2.0, z), Vector3(9.0, 4.0, 7.0), wall_mat)
		_box(self, Vector3(x, 4.5, z), Vector3(10.5, 1.0, 8.5), roof_mat, 0.08 if i % 2 == 0 else -0.08)
