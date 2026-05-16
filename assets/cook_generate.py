"""
Haunted Wok - Creepy Cook Character Generator
Blenderのスクリプトエディタに貼り付けて実行してください
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector


# =====================================
#  ユーティリティ
# =====================================

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in bpy.data.collections:
        bpy.data.collections.remove(col)


def new_material(name, color, roughness=1.0, metallic=0.0):
    """フラットシェーディング用マテリアル（自発光なし）"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    mat.use_backface_culling = False
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    # Emission なし
    bsdf.inputs["Emission Color"].default_value = (0.0, 0.0, 0.0, 1.0)
    bsdf.inputs["Emission Strength"].default_value = 0.0
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def assign_material(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def set_flat_shading(obj):
    """フラットシェーディングを適用"""
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_flat()
    obj.select_set(False)


def add_to_collection(obj, col):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)


# =====================================
#  パーツ生成
# =====================================

def make_body(col, mat):
    """
    筋肉質なボックス体型：中央が膨らんだ樽型
    """
    bm = bmesh.new()

    # ローポリ樽：上下を細く、中央を太く
    segments = 8
    layers = [
        # (y_offset, radius)
        (-1.20, 0.55),  # 足元
        (-0.85, 0.65),
        (-0.45, 0.80),  # 腰
        ( 0.00, 0.90),  # 胴中央（最大）
        ( 0.45, 0.85),  # 胸
        ( 0.80, 0.70),  # 肩あたり
        ( 1.10, 0.55),  # 首元
    ]

    vert_rings = []
    for (y, r) in layers:
        ring = []
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            x = math.cos(angle) * r
            z = math.sin(angle) * r * 0.75  # 奥行きを少し潰してボックス感
            ring.append(bm.verts.new((x, y, z)))
        vert_rings.append(ring)

    # 天面・底面キャップ
    bottom_cap = bm.verts.new((0, layers[0][0] - 0.05, 0))
    top_cap    = bm.verts.new((0, layers[-1][0] + 0.05, 0))

    # サイド面
    for ri in range(len(vert_rings) - 1):
        r0 = vert_rings[ri]
        r1 = vert_rings[ri + 1]
        for i in range(segments):
            ni = (i + 1) % segments
            bm.faces.new([r0[i], r0[ni], r1[ni], r1[i]])

    # 底面
    for i in range(segments):
        bm.faces.new([vert_rings[0][(i+1) % segments], vert_rings[0][i], bottom_cap])
    # 天面
    for i in range(segments):
        bm.faces.new([vert_rings[-1][i], vert_rings[-1][(i+1) % segments], top_cap])

    bm.normal_update()
    mesh = bpy.data.meshes.new("BodyMesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Body", mesh)
    add_to_collection(obj, col)
    assign_material(obj, mat)
    set_flat_shading(obj)

    # Y軸が上向きになるよう回転
    obj.rotation_euler = (math.radians(90), 0, 0)
    obj.location = (0, 0, 1.1)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(rotation=True)
    return obj


def make_arm(col, mat, side=1):
    """腕：上腕と前腕の2ブロック、Tポーズ"""
    objs = []
    # 上腕
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=6, radius=0.22, depth=0.7,
        location=(side * 1.15, 1.45, 0)
    )
    upper = bpy.context.active_object
    upper.name = f"Arm_Upper_{'R' if side > 0 else 'L'}"
    upper.rotation_euler = (0, 0, math.radians(90))
    bpy.ops.object.transform_apply(rotation=True)
    assign_material(upper, mat)
    set_flat_shading(upper)
    add_to_collection(upper, col)
    objs.append(upper)

    # 前腕（少し細く・短く）
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=6, radius=0.18, depth=0.6,
        location=(side * 1.80, 1.35, 0)
    )
    lower = bpy.context.active_object
    lower.name = f"Arm_Lower_{'R' if side > 0 else 'L'}"
    lower.rotation_euler = (0, 0, math.radians(90))
    bpy.ops.object.transform_apply(rotation=True)
    assign_material(lower, mat)
    set_flat_shading(lower)
    add_to_collection(lower, col)
    objs.append(lower)

    # 手（ボックス）
    bpy.ops.mesh.primitive_cube_add(
        size=1,
        location=(side * 2.28, 1.30, 0)
    )
    hand = bpy.context.active_object
    hand.name = f"Hand_{'R' if side > 0 else 'L'}"
    hand.scale = (0.28, 0.20, 0.35)
    bpy.ops.object.transform_apply(scale=True)
    assign_material(hand, mat)
    set_flat_shading(hand)
    add_to_collection(hand, col)
    objs.append(hand)

    return objs


def make_legs(col, mat):
    """脚：ずんぐりした2本足"""
    objs = []
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=6, radius=0.28, depth=1.1,
            location=(side * 0.38, 0.0, 0.55)
        )
        leg = bpy.context.active_object
        leg.name = f"Leg_{'R' if side > 0 else 'L'}"
        assign_material(leg, mat)
        set_flat_shading(leg)
        add_to_collection(leg, col)
        objs.append(leg)

        # 足先（扁平キューブ）
        bpy.ops.mesh.primitive_cube_add(location=(side * 0.38, 0.20, 0.0))
        foot = bpy.context.active_object
        foot.name = f"Foot_{'R' if side > 0 else 'L'}"
        foot.scale = (0.32, 0.55, 0.15)
        bpy.ops.object.transform_apply(scale=True)
        assign_material(foot, mat)
        set_flat_shading(foot)
        add_to_collection(foot, col)
        objs.append(foot)

    return objs


def make_head(col, mat_skin, mat_eye, mat_lip, mat_white):
    """
    頭：球体ベース
    - 巨大な真っ黒の目玉（虹彩なし）
    - 分厚い唇
    """
    # --- 頭本体 ---
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=12, ring_count=8,
        radius=0.72,
        location=(0, 0, 3.12)
    )
    head = bpy.context.active_object
    head.name = "Head"
    # 少し縦長に
    head.scale = (1.0, 0.90, 1.08)
    bpy.ops.object.transform_apply(scale=True)
    assign_material(head, mat_skin)
    set_flat_shading(head)
    add_to_collection(head, col)

    # --- 目玉（左右） ---
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=10, ring_count=7,
            radius=0.21,
            location=(side * 0.26, 0.62, 3.20)
        )
        eye = bpy.context.active_object
        eye.name = f"Eye_{'R' if side > 0 else 'L'}"
        assign_material(eye, mat_eye)
        set_flat_shading(eye)
        add_to_collection(eye, col)

        # 白目（わずかに大きい白い球・後ろ側に配置してリング感）
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=10, ring_count=7,
            radius=0.245,
            location=(side * 0.26, 0.595, 3.20)
        )
        eye_white = bpy.context.active_object
        eye_white.name = f"EyeWhite_{'R' if side > 0 else 'L'}"
        assign_material(eye_white, mat_white)
        set_flat_shading(eye_white)
        add_to_collection(eye_white, col)

    # --- 唇 ---
    # 上唇
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=10, ring_count=6,
        radius=0.18,
        location=(0, 0.65, 2.82)
    )
    upper_lip = bpy.context.active_object
    upper_lip.name = "Lip_Upper"
    upper_lip.scale = (1.8, 1.0, 0.6)
    bpy.ops.object.transform_apply(scale=True)
    assign_material(upper_lip, mat_lip)
    set_flat_shading(upper_lip)
    add_to_collection(upper_lip, col)

    # 下唇（より分厚く）
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=10, ring_count=6,
        radius=0.22,
        location=(0, 0.64, 2.67)
    )
    lower_lip = bpy.context.active_object
    lower_lip.name = "Lip_Lower"
    lower_lip.scale = (1.6, 1.0, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    assign_material(lower_lip, mat_lip)
    set_flat_shading(lower_lip)
    add_to_collection(lower_lip, col)

    return head


def make_cook_hat(col, mat_white):
    """コック帽：白い円柱 + ブリム（つば）"""
    # 帽子本体（背の高い円柱）
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12, radius=0.52, depth=1.10,
        location=(0, 0, 4.18)
    )
    hat_body = bpy.context.active_object
    hat_body.name = "HatBody"
    assign_material(hat_body, mat_white)
    set_flat_shading(hat_body)
    add_to_collection(hat_body, col)

    # ブリム（平たいディスク）
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=0.72, depth=0.10,
        location=(0, 0, 3.67)
    )
    hat_brim = bpy.context.active_object
    hat_brim.name = "HatBrim"
    assign_material(hat_brim, mat_white)
    set_flat_shading(hat_brim)
    add_to_collection(hat_brim, col)

    return hat_body, hat_brim


def make_apron(col):
    """エプロン：暗い赤茶の板ポリ"""
    mat_apron = new_material("Apron", (0.239, 0.102, 0.102))  # 暗い赤茶 #3d1a1a

    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.92, 1.55))
    apron = bpy.context.active_object
    apron.name = "Apron"
    apron.scale = (0.72, 1.0, 1.05)
    bpy.ops.object.transform_apply(scale=True)
    apron.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    assign_material(apron, mat_apron)
    set_flat_shading(apron)
    add_to_collection(apron, col)
    return apron


def make_cleaver(col):
    """中華包丁：右手に持たせる"""
    mat_metal = new_material("Metal", (0.85, 0.85, 0.90), roughness=0.2, metallic=0.9)
    mat_handle = new_material("Handle", (0.4, 0.2, 0.05))

    # 刃
    bpy.ops.mesh.primitive_cube_add(location=(2.55, 1.30, 0.15))
    blade = bpy.context.active_object
    blade.name = "Cleaver_Blade"
    blade.scale = (0.08, 0.45, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    assign_material(blade, mat_metal)
    set_flat_shading(blade)
    add_to_collection(blade, col)

    # 柄
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=6, radius=0.06, depth=0.36,
        location=(2.55, 1.30, -0.28)
    )
    handle = bpy.context.active_object
    handle.name = "Cleaver_Handle"
    assign_material(handle, mat_handle)
    set_flat_shading(handle)
    add_to_collection(handle, col)

    return blade, handle


# =====================================
#  メイン
# =====================================

def build_cook():
    print("=== Haunted Wok Cook: 生成開始 ===")
    clear_scene()

    # コレクション
    col = bpy.data.collections.new("HauntedCook")
    bpy.context.scene.collection.children.link(col)

    # --- マテリアル定義 ---
    # 肌：暗い緑がかった灰色 #2a2a2a
    mat_skin  = new_material("Skin",  (0.165, 0.165, 0.165))
    # 目：真っ黒（虹彩なし）#050505
    mat_eye   = new_material("Eye",   (0.020, 0.020, 0.020))
    # 白目リング（薄汚れた白）
    mat_white = new_material("White", (0.85, 0.85, 0.85))
    # 唇：暗い赤 #8b0000
    mat_lip   = new_material("Lip",   (0.545, 0.0, 0.0))
    # コック帽：薄汚れた灰色 #888888
    mat_hat   = new_material("Hat",   (0.533, 0.533, 0.533))

    # --- パーツ構築 ---
    make_body(col, mat_skin)
    make_arm(col, mat_skin, side=1)   # 右腕
    make_arm(col, mat_skin, side=-1)  # 左腕
    make_legs(col, mat_skin)
    make_head(col, mat_skin, mat_eye, mat_lip, mat_white)
    make_cook_hat(col, mat_hat)
    make_apron(col)
    make_cleaver(col)

    # --- ライティング ---
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
    sun = bpy.context.active_object
    sun.data.energy = 3.0
    add_to_collection(sun, col)

    bpy.ops.object.light_add(type='POINT', location=(-3, -4, 5))
    fill = bpy.context.active_object
    fill.data.energy = 500
    fill.data.color = (0.5, 1.0, 0.8)  # 不気味な緑っぽい補助光
    add_to_collection(fill, col)

    # --- カメラ ---
    bpy.ops.object.camera_add(location=(5, -7, 3.5))
    cam = bpy.context.active_object
    cam.rotation_euler = (math.radians(75), 0, math.radians(35))
    add_to_collection(cam, col)
    bpy.context.scene.camera = cam

    print("=== パーツ生成完了 ===")
    return col


def export_gltf():
    """glTF 形式でエクスポート（Blender 4.x 対応）"""
    export_path = os.path.expanduser("~/haunted-wok/assets/cook.glb")
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,          # モディファイア適用
        export_materials='EXPORT',
        export_cameras=True,
        export_lights=True,
        # export_yup: Blender 4.2+ で廃止（常に Y-up）
        # export_colors: Blender 4.x で廃止
    )
    print(f"=== エクスポート完了: {export_path} ===")


# =====================================
#  実行
# =====================================

if __name__ == "__main__":
    build_cook()
    export_gltf()
    print(">>> Haunted Wok Cook 完成！ <<<")
