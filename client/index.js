import * as alt from "alt-client";
import * as native from "natives";

let isNoclipEnabled = false;
let flySpeed = 1;
let scaleSpeed = 1;
let cordsGov = {x: -514.7732543945312, y: -256.0583801269531, z: 37.507728576660156}
let soundMarkerPlayed = false
let noclipPressed = false;
let inMissionGov = false;
let points_Stage = [];
let pointBlip = [];
let points_StageReached = [];
const missionGov = { dimension: 11, stage3: {started: false, markers: {reached: [], blip: [], all: []}, finished_first: false,finished_second: false}, stage4: {started: false, points: [], marker: [], markerReached: [], blips: [],endMarkers: [], endMarkersTaked: [], finished: false}, end: {points: [], sceene: false} }

function spawnBlip(x, y, z) {

    const blipSpawn = new alt.PointBlip(x,y,z);
    blipSpawn.dimension = 0;
    blipSpawn.sprite = 66
    blipSpawn.color = 3;
    blipSpawn.name = "Спавн"
    blipSpawn.shortRange = false;

    const blipGov = new alt.PointBlip(cordsGov.x, cordsGov.y, cordsGov.z);
    blipGov.dimension = 0;
    blipGov.sprite = 358
    blipGov.color = 0;
    blipGov.name = "Задание"
    blipGov.shortRange = true;
}

function markers() {
    native.drawMarker(
        1, // Тип маркера (цилиндр)
        cordsGov.x, cordsGov.y, cordsGov.z - 3, // Позиция
        0, 0, 0, // Направление
        0, 0, 0, // Вращение
        1.5, 1.5, 1, // Размер маркера
        25, 100, 180, 100, // Цвет 
        false, // Без анимации вверх-вниз
        false, // Не поворачивать к камере
        2, // Доп. параметр (обычно false или 2)
        false, // Без вращения
        null, null, false // Без текстур и других объектов
    );
}

function soundMarker() {
    const playerPos = alt.Player.local.pos

    const distance = Math.sqrt(
        Math.pow(cordsGov.x - playerPos.x, 2) +
        Math.pow(cordsGov.y - playerPos.y, 2) +
        Math.pow(cordsGov.z - playerPos.z, 2)
    );

    if (distance <= 2 && !soundMarkerPlayed) {
    native.playSoundFromCoord(1, "NO", cordsGov.x, cordsGov.y, cordsGov.z, "HUD_FRONTEND_DEFAULT_SOUNDSET", false, 0, false);
    soundMarkerPlayed = true
    }

    if (distance >= 2 && soundMarkerPlayed) {
    soundMarkerPlayed = false
    }

    if (distance <= 2 && native.isControlPressed(0, 38)) {
        alt.emitServer("tp", alt.Player.local)
        alt.emitServer("mission_gov", alt.Player.local)
    }

}

function toggleNoclip() {
    const player = alt.Player.local;

    isNoclipEnabled = !isNoclipEnabled;

    if (isNoclipEnabled) {
        native.freezeEntityPosition(player.scriptID, true); // Отключаем физику персонажа
        native.setEntityInvincible(player.scriptID, true);  // Персонаж становится неуязвимым
        alt.log('Noclip enabled');
    } else {
        native.freezeEntityPosition(player.scriptID, false); // Включаем физику обратно
        native.setEntityInvincible(player.scriptID, false);  // Уязвимость возвращается
        alt.log('Noclip disabled');
    }
}

// Ноуклип
function getCamDirection() {
    const camRot = native.getGameplayCamRot(0); 

    const radX = camRot.x * (Math.PI / 180.0); 
    const radZ = camRot.z * (Math.PI / 180.0); 

    const dirX = -Math.sin(radZ) * Math.cos(radX); 
    const dirY = Math.cos(radZ) * Math.cos(radX);  
    const dirZ = Math.sin(radX);                   

    return { x: dirX, y: dirY, z: dirZ };
}

function noclip() {
    if (!isNoclipEnabled) return;
    
    const player = alt.Player.local;
    let position = {...player.pos};

    let resultSpeed = flySpeed * scaleSpeed;

    const camDir = getCamDirection(); // Получаем направление камеры
    let isMoving = false;

    if (native.isControlPressed(0, 21)) {
        scaleSpeed = 2;
    } else {
        scaleSpeed = 1;
    }

    if (native.isControlPressed(0, 45) && flySpeed < 5 && !noclipPressed) {
        noclipPressed = true;
        flySpeed += 1;
        console.log("Плюс");
        setTimeout(() => {
            noclipPressed = false
        }, 250)
    }

    if (native.isControlPressed(0, 49) && flySpeed > 1 && !noclipPressed) {
        noclipPressed = true;
        flySpeed -= 1;
        console.log("Минус");
        setTimeout(() => {
            noclipPressed = false
        }, 250)

    }


    if (native.isControlPressed(0, 32)) { // W
        position.x += camDir.x * resultSpeed;
        position.y += camDir.y * resultSpeed;
        position.z += camDir.z * resultSpeed - 1;
        isMoving = true;
    }

    // Назад (S)
    if (native.isControlPressed(0, 33)) { // S
        position.x -= camDir.x * resultSpeed;
        position.y -= camDir.y * resultSpeed;
        position.z -= camDir.z * resultSpeed + 1;
        isMoving = true;
    }

    if (native.isControlPressed(0, 54)) { // E
        position.z;
        isMoving = true;
    }
    
    if (native.isControlPressed(0, 44)) { // Q
        position.z -= 2
        isMoving = true;
    }

    if (isMoving) {
        native.setEntityCoords(player.scriptID, position.x, position.y, position.z, false, false, false, false);
    }
    
};

alt.everyTick(() => { 
    noclip();
    markers();
    soundMarker();
    if (inMissionGov) {
        alt.emit("points_missionGov", points_Stage)
    }

    if (native.isControlPressed(0, 48)) {
        console.log(alt.Player.local.pos, alt.Player.local.rot);
        console.log(native.getHashKey("weapon_carbinerifle"));
    }
    
});

alt.onServer('spawn', () => {
    spawnBlip(0, 0, 72);
});

alt.onServer('start_missionGov', () => {
    const player = alt.Player.local
    
    if (points_Stage.length == 0 && !inMissionGov) {
    const firstPoint = new alt.Checkpoint(
        0, 
        {x: -637.6608276367188, y: -186.94668579101562, z: 36.7},
        {x: -727.30029296875, y: -235.31668090820312, z: 35.66429901123047},
        3, 1, 
        {r: 5, g: 60, b: 222, a: 80}, 
        {r: 5, g: 60, b: 222, a: 80}, 1000
    ) 
    const secondPoint = new alt.Checkpoint(
        0, 
        {x: -727.30029296875, y: -235.31668090820312, z: 35.66429901123047},
        { x: -799.8739624023438, y: -247.46939086914062, z: 35.62736511230469 },
        3, 1, 
        {r: 5, g: 60, b: 222, a: 80}, 
        {r: 5, g: 60, b: 222, a: 80}, 1000
    ) 
    const thirdPoint = new alt.Checkpoint(
        0, 
        {x: -799.8739624023438,y: -247.46939086914062,z: 35.62736511230469},
        { x: -866.4444580078125, y: -129.57679748535156, z: 36.48365783691406}, 
        3, 1, 
        {r: 5, g: 60, b: 222, a: 80}, 
        {r: 5, g: 60, b: 222, a: 80}, 1000
    ) 
    const fourthPoint = new alt.Checkpoint(
        0, 
        { x: -866.4444580078125, y: -129.57679748535156, z: 36.48365783691406}, 
        { x: -1016.0107421875, y: -175.51760864257812, z: 36.388671875},
        3, 1, 
        {r: 5, g: 60, b: 222, a: 80}, 
        {r: 5, g: 60, b: 222, a: 80}, 1000
    ) 
    const fifthPoint = new alt.Checkpoint(
        0, 
        { x: -1016.0107421875, y: -175.51760864257812, z: 36.388671875}, 
        { x: -1206.4691162109375, y: -284.4284362792969, z: 36.36253356933594},
        3, 1, 
        {r: 5, g: 60, b: 222, a: 80}, 
        {r: 5, g: 60, b: 222, a: 80}, 1000
    )
    const sixPoint = new alt.Checkpoint(
        0, 
        { x: -1206.4691162109375, y: -284.4284362792969, z: 36.36253356933594}, 
        { x: -1243.3824462890625, y: -254.85792541503906, z: 37.67501449584961},
        3, 1, 
        {r: 5, g: 60, b: 222, a: 80}, 
        {r: 5, g: 60, b: 222, a: 80}, 1000
    )
    const sevenPoint = new alt.Checkpoint(
        4, 
        { x: -1243.3824462890625, y: -254.85792541503906, z: 37.67501449584961}, 
        { x: -1243.3824462890625, y: -254.85792541503906, z: 37.67501449584961},
        3, 1, 
        {r: 5, g: 60, b: 222, a: 80}, 
        {r: 5, g: 60, b: 222, a: 80}, 1000
    )
    points_Stage = [firstPoint, secondPoint, thirdPoint, fourthPoint, fifthPoint, sixPoint, sevenPoint]
    points_Stage.forEach((obj) => {
        obj.dimension = 11;
        obj.visible = false;
        obj.taked = false
        })
    
    inMissionGov =  true;
    alt.emit("points_missionGov", points_Stage)
    
    } else {
        alt.emit("points_missionGov", points_Stage)
    }
});

alt.on("points_missionGov", (arr) => {
    const noReached = arr.filter(element => !points_StageReached.includes(element))
    if (noReached.length !== 0) {
        const obj = noReached[0]
        if (obj.taked == false) {
            const player = alt.Player.local
            const playerPos = player.pos;
    
            obj.visible = true;

            if (pointBlip.length < 1) {
                const point = new alt.PointBlip(obj.pos.x, obj.pos.y, obj.pos.z);
                point.dimension = 11;
                point.sprite = 1;
                point.color = 0;
                point.name = `Точка #${8 - noReached.length}`
                point.shortRange = false;
                pointBlip.push(point)
            }
                     
            let distance = Math.sqrt(
                Math.pow(obj.pos.x - playerPos.x, 2) +
                Math.pow(obj.pos.y - playerPos.y, 2) +
                Math.pow(obj.pos.z - playerPos.z, 2)
            );
    
            if (distance <= 5) {
                
                points_StageReached.push(obj)
                pointBlip[0].destroy()
                pointBlip.pop()
                obj.visible = false;
                obj.taked = true
            }
        }
    } else {
        alt.emit("points_missionGovStage2")
    }
})

alt.on("points_missionGovStage2", () => {
    const player = alt.Player.local;

    if (inMissionGov && pointBlip.length == 0) {
        if (player.vehicle) {
            native.taskLeaveVehicle(player.scriptID, player.vehicle.scriptID, 0)
        }

        const point = new alt.PointBlip(-1213.7703857421875, -328.8423767089844, 37.79074478149414);
        point.dimension = 11;
        point.sprite = 500;
        point.color = 1;
        point.name = `Ограбление банка`;
        point.shortRange = false;
        pointBlip.push(point);

        const relationshipHash = native.getHashKey('GANG_1');
        const relationHash = native.getHashKey('PLAYER');
        native.setRelationshipBetweenGroups(2, relationshipHash, relationHash)
    }

    alt.emitServer("missionGov_stage2", player);
})

alt.onServer("pedGW_Gov", (ped, check, veh) => {
    const player = alt.Player.local;

    const relationshipHash = native.getHashKey('GANG_1');
    const weaponHashRifle = native.getHashKey("WEAPON_ASSAULTRIFLE");
    const weaponHashPpstol = native.getHashKey("WEAPON_PISTOL");

    if (check) {
        native.giveWeaponToPed(ped.scriptID, weaponHashPpstol, 300, false, true);
        native.setCurrentPedWeapon(ped.scriptID, weaponHashPpstol, true)
        alt.setTimeout(() => {native.taskWarpPedIntoVehicle(ped.scriptID, veh.scriptID, -1) }, 1000);
    } else {
        native.giveWeaponToPed(ped.scriptID, weaponHashRifle, 300, false, true);
        native.setCurrentPedWeapon(ped.scriptID, weaponHashRifle, true)
    }
    
    native.addArmourToPed(ped.scriptID, 100)
    native.setPedRelationshipGroupHash(ped.scriptID, relationshipHash)
    native.setPedCombatAbility(ped.scriptID, 2);
})

alt.onServer("missionGovStage3", () => {
    const player = alt.Player.local;

    if (!missionGov.stage3.started) {
        if (player.vehicle) {
            native.taskLeaveVehicle(player.scriptID, player.vehicle.scriptID, 0);
        }
        missionGov.stage3.started = true;
    }

    if (missionGov.stage3.markers.all.length == 0) {

        missionGov.stage3.markers.all[0] = new alt.Checkpoint(0, {x: -1250.226318359375,y: -264.31585693359375,z: 37.9227409362793}, {x: -1247.1343994140625,y: -269.3708190917969,z: 37.9852180480957 }, 1, 1, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000 )
        missionGov.stage3.markers.all[1] = new alt.Checkpoint(0, {x: -1247.1343994140625,y: -269.3708190917969,z: 37.9852180480957 }, {x: -1246.5455322265625,y: -270.4250183105469,z: 43.14745330810547 }, 1, 1, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000 )
        missionGov.stage3.markers.all[2] = new alt.Checkpoint(0, {x: -1246.5455322265625,y: -270.4250183105469,z: 43.14745330810547 }, {x: -1238.8955078125,y: -285.87847900390625,z: 42.15237808227539 }, 1, 1, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000 )
        missionGov.stage3.markers.all[3] = new alt.Checkpoint(0, {x: -1238.8955078125,y: -285.87847900390625,z: 42.15237808227539 }, {x: -1238.8955078125,y: -285.87847900390625,z: 42.15237808227539 }, 1, 1, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000 )

        missionGov.stage3.markers.all.forEach((obj) => {

            obj.dimension = missionGov.dimension;
            obj.visible = false;
            obj.taked = false
            })
    }

    if (missionGov.stage3.started && !missionGov.stage3.finished_first) {
        const noReached = missionGov.stage3.markers.all.filter(element => !missionGov.stage3.markers.reached.includes(element))
        if (noReached.length !== 0) {
            const obj = noReached[0]
            if (obj.taked == false) {
                const player = alt.Player.local
                const playerPos = player.pos;

                obj.visible = true;
                
                if (missionGov.stage3.markers.blip.length < 1) {
                    const point = new alt.PointBlip(obj.pos.x, obj.pos.y, obj.pos.z);
                    point.dimension = missionGov.dimension;
                    point.sprite = 1;
                    point.color = 0;
                    point.name = `Точка #${5 - noReached.length}`
                    point.shortRange = false;
                    missionGov.stage3.markers.blip.push(point)
                }
                         
                let distance = Math.sqrt(
                    Math.pow(obj.pos.x - playerPos.x, 2) +
                    Math.pow(obj.pos.y - playerPos.y, 2) +
                    Math.pow(obj.pos.z - playerPos.z, 2)
                );
        
                if (distance <= 2) {
                    missionGov.stage3.markers.reached.push(obj)
                    missionGov.stage3.markers.blip[0].destroy()
                    missionGov.stage3.markers.blip.pop()
                    obj.visible = false;
                    obj.taked = true
                }
            };
        }
        if (!missionGov.stage3.finished_first && noReached.length == 0) {
            missionGov.stage3.finished_first = true
        }
    }
    if (missionGov.stage3.started && !missionGov.stage3.finished_second) {
        alt.emitServer("finish_stage3", player)
    }
    if (missionGov.stage3.finished_first && missionGov.stage3.finished_second) {
        alt.emitServer("start_stage4", player)
    }
})

alt.onServer("finish_2stage3", () => {
    missionGov.stage3.finished_second = true
})

alt.onServer("stage4_blip", (veh) => {
    const player = alt.Player.local;
    const playerPos = player.pos;
    const obj = {x: veh.pos.x, y: veh.pos.y, z: veh.pos.z - 1.5};

    if (missionGov.stage4.marker.length == 0 && missionGov.stage4.markerReached.length == 0, missionGov.stage4.blips == 0) {
        missionGov.stage4.marker[0] = new alt.Checkpoint(0, obj, obj, 4, 100, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 100);
        missionGov.stage4.marker[0].dimension = missionGov.dimension;

        missionGov.stage4.blips[0] = new alt.PointBlip(obj.x, obj.y, obj.z)
        missionGov.stage4.blips[0].dimension = missionGov.dimension;
        missionGov.stage4.blips[0].sprite = 1;
        missionGov.stage4.blips[0].color = 0;
        missionGov.stage4.blips[0].name = `Грузовик`;
        missionGov.stage4.blips[0].shortRange = false;
    }
    if (missionGov.stage4.marker.length == 1 && missionGov.stage4.markerReached.length == 0 && missionGov.stage4.blips.length == 1) {
        let distance = Math.sqrt(
            Math.pow(obj.x - playerPos.x, 2) +
            Math.pow(obj.y - playerPos.y, 2) +
            Math.pow(obj.z - playerPos.z, 2)
        );

        if (distance <= 3.5) {
            missionGov.stage4.marker[0].visible = false;
            missionGov.stage4.blips[0].visible = false;
            missionGov.stage4.markerReached.push(missionGov.stage4.marker[0]);
        }
    }
    
    if (missionGov.stage4.markerReached.length == 1 && missionGov.stage4.endMarkers.length == 0) {
        missionGov.stage4.endMarkers[0] = new alt.Checkpoint(0, {x: -1281.2926025390625, y: -329.85186767578125, z: 35.75726318359375}, {x: -1363.098388671875,y: -376.88153076171875,z: 35.772308349609375}, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)
        missionGov.stage4.endMarkers[1] = new alt.Checkpoint(0, {x: -1363.098388671875,y: -376.88153076171875,z: 35.772308349609375},{x: -1317.8331298828125,y: -492.0862731933594,z: 32.24286651611328 }, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)
        missionGov.stage4.endMarkers[2] = new alt.Checkpoint(0, {x: -1317.8331298828125,y: -492.0862731933594,z: 32.24286651611328 }, {x: -1236.705810546875,y: -587.9661865234375,z: 26.241668701171875}, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)
        missionGov.stage4.endMarkers[3] = new alt.Checkpoint(0, {x: -1236.705810546875,y: -587.9661865234375,z: 26.241668701171875}, {x: -1150.650146484375,y: -697.9161987304688,z: 20.577348709106445 }, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)
        missionGov.stage4.endMarkers[4] = new alt.Checkpoint(0, {x: -1150.650146484375,y: -697.9161987304688,z: 20.577348709106445 }, {x: -1103.279541015625,y: -752.4329223632812,z: 18.343290328979492 }, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)
        missionGov.stage4.endMarkers[5] = new alt.Checkpoint(0, {x: -1103.279541015625,y: -752.4329223632812,z: 18.343290328979492 }, {x: -1151.5775146484375,y: -824.7076416015625,z: 13.58166790008545}, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)
        missionGov.stage4.endMarkers[6] = new alt.Checkpoint(0, {x: -1151.5775146484375,y: -824.7076416015625,z: 13.58166790008545}, {x: -1139.0091552734375,y: -857.519287109375,z: 12.512360572814941}, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)
        missionGov.stage4.endMarkers[7] = new alt.Checkpoint(4, {x: -1139.0091552734375,y: -857.519287109375,z: 12.512360572814941}, {x: -1139.0091552734375,y: -857.519287109375,z: 12.512360572814941}, 5, 10, {r: 5, g: 60, b: 222, a: 80}, {r: 5, g: 60, b: 222, a: 80}, 1000)

        missionGov.stage4.endMarkers.forEach((obj) => {
            obj.dimension = missionGov.dimension;
            obj.visible = false;
            obj.taked = false;
            })
    }

    if (missionGov.stage4.endMarkers.length !== 0) {
        const noReached = missionGov.stage4.endMarkers.filter((element) => !missionGov.stage4.endMarkersTaked.includes(element))
    
        if (noReached.length !== 0) {
            const obj = noReached[0];
            obj.visible = true;
            
            let distance = Math.sqrt(
                Math.pow(obj.pos.x - playerPos.x, 2) +
                Math.pow(obj.pos.y - playerPos.y, 2) +
                Math.pow(obj.pos.z - playerPos.z, 2)
            );

            if (missionGov.stage4.points.length == 0) {
                missionGov.stage4.points[0] = new alt.PointBlip(obj.pos.x, obj.pos.y, obj.pos.z);
                missionGov.stage4.points[0].dimension = 11;
                missionGov.stage4.points[0].sprite = 1;
                missionGov.stage4.points[0].color = 0;
                missionGov.stage4.points[0].name = `Точка #${8 - noReached.length}`
                missionGov.stage4.points[0].shortRange = false;
            }
    
            if (distance <= 5) {
                missionGov.stage4.endMarkersTaked.push(obj)
                missionGov.stage4.points[0].destroy()
                missionGov.stage4.points.pop()
                obj.visible = false;
                obj.taked = true;
            }
        } else if (!missionGov.stage4.finished) {
            if (player.vehicle) {
                native.taskLeaveVehicle(player.scriptID, player.vehicle.scriptID, 0);
            }
            missionGov.stage4.finished = true;
        }

        if (missionGov.stage4.finished && missionGov.end.points.length == 0) {
            missionGov.end.points[0] = new alt.Marker(1, {x: -1112.5565185546875,y: -848.3710327148438,z: 12.440711975097656}, {r: 5, g: 60, b: 222, a: 80}, true, 1000)
            missionGov.end.points[1] = new alt.Marker(1, {x: -1107.1121826171875,y: -832.6088256835938,z: 36.67536544799805 }, {r: 5, g: 60, b: 222, a: 80}, true, 1000)
            // const test = new alt.Marker(1, {x: -1107.1121826171875,y: -832.6088256835938,z: 37.67536544799805 }, {r: 5, g: 60, b: 222, a: 80}, true, 1000)
            // test.scale

            missionGov.end.points.forEach(element => {element.dimension = missionGov.dimension, element.scale = {x: 1.5, y: 1.5, z: 1}, element.visible = true})
            alt.emitServer("missionGov_end")
        }

        if (missionGov.end.points.length !== 0) {
            missionGov.end.points.forEach(obj => {
        
                let distance = Math.sqrt(
                    Math.pow(obj.pos.x - playerPos.x, 2) +
                    Math.pow(obj.pos.y - playerPos.y, 2) +
                    Math.pow(obj.pos.z - playerPos.z, 2)
                );

                if (distance <= 2 && native.isControlPressed(0, 38)) {
                    alt.emitServer("misiionGovSwitchFloor", alt.Player.local, obj.id)
                }
            })
        }
    }
})
 
alt.on("keydown", (key) => {
    if (key === 116) {
        toggleNoclip();
    }
})

