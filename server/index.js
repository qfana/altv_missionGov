import alt from "alt-server";

const missionGov = { dimension: 11, peds: [], vehs: [], gunsGived: [], pedsDied: [], stage3_started: false, stage3_finish: false, stage4: {start: false, finish: false, blip: false}, swapedFloor: false}

alt.on("playerConnect", (player) => {
    console.log(`${player.name} connected to server.`);
    player.dimension = 0
    player.spawn(-519.47314453125, -252.92324829101562, 35.668949127197266);
    player.model = 'mp_m_freemode_01';

    alt.onClient("tp", (player) => {

        player.pos = {
            x: -564.1688842773438,
            y: -168.47317504882812,
            z: 37.739463806152344
        };
        player.rot = {
            x: 0,
            y: 0,
            z: 0.35
        }
        player.dimension = missionGov.dimension
        
    });

    alt.onClient("mission_gov", (player) => {
        const vehMissionGov = new alt.Vehicle("police4", -564.8412475585938, -164.24124145507812, 37.7753173828125, 0, 0, 1.93, 1000);
        player.model = "mp_m_fibsec_01";
        player.armour = 100;
        vehMissionGov.numberPlateText = "FIB";
        vehMissionGov.dimension = player.dimension;
        player.setIntoVehicle(vehMissionGov, 1);
        setTimeout(() => {
            vehMissionGov.sirenActive = true;
        }, 3000)
        console.log(player.id);
        
        alt.emitClient(player, "start_missionGov", vehMissionGov)
    })
});

alt.on("start_missionGov", (veh, player) => {
    console.log(veh);
    console.log(player);
    alt.emitClient(player, "start_missionGov")
})

alt.onClient("missionGov_stage2", (player) => {
    if (missionGov.peds.length == 0 && missionGov.vehs.length == 0) {
        missionGov.peds[0] = new alt.Ped("g_m_y_famdnf_01", {x: -1211.992919921875,y: -327.7561340332031,z: 37.781063079833984}, { x: 0, y: 0, z: 0.7412132024765015 }, 100);
        missionGov.peds[1] = new alt.Ped("g_f_y_families_01", {x: -1228.532470703125,y: -324.4216003417969,z: 37.487552642822266}, { x: 0, y: 0, z: -0.4267476201057434 }, 100);
        missionGov.peds[2] = new alt.Ped("mp_m_famdd_01", {x: -1215.330810546875,y: -318.06268310546875,z: 37.73423767089844 }, { x: 0, y: 0, z: -0.1836368441581726 }, 100);
        missionGov.peds[3] = new alt.Ped("g_m_y_famdnf_01", {x: -1208.151611328125,y: -321.3777160644531,z: 37.816070556640625 }, { x: 0, y: 0, z: 1.5338325500488281 }, 100);
        missionGov.peds[4] = new alt.Ped("g_f_y_families_01", {x: -1215.95849609375,y: -330.0760498046875,z: 37.78087615966797 }, { x: 0, y: 0, z: -0.20668889582157135 }, 100);
        missionGov.peds[5] = new alt.Ped("g_m_y_famdnf_01", {x: -1206.8643798828125,y: -316.1321716308594,z: 37.81366729736328 }, { x: 0, y: 0, z: -0.3273632824420929 }, 100);
        missionGov.peds[6] = new alt.Ped("mp_m_famdd_01", {x: -1212.038330078125,y: -332.24517822265625,z: 37.78093338012695 }, { x: 0, y: 0, z: 0.4448730945587158 }, 100);
        missionGov.peds[7] = new alt.Ped("g_m_y_famdnf_01", {x: -1212.406005859375,y: -336.076171875,z: 37.790771484375 }, { x: 0, y: 0, z: 2.1255710124969482 } , 100);
        missionGov.peds[8] = new alt.Ped("mp_m_famdd_01", {x: -1215.957763671875,y: -334.2454528808594,z: 37.78086853027344 }, { x: 0, y: 0, z: 1.0647906064987183 }, 100);

        
        missionGov.vehs[0] = new alt.Vehicle("mule4", -1207.7938232421875, -318.5871276855469, 37.79763412475586, 0, 0, -1.0839691162109375, 100); 
        missionGov.vehs[1] = new alt.Vehicle("dubsta2", -1229.519287109375, -322.4803161621094, 37.39681625366211, 0, 0, -1.1366711854934692, 100);
        missionGov.vehs[2] = new alt.Vehicle("dubsta2", -1216.240966796875, -315.6208801269531, 37.63428497314453, 0, 0, -1.119340419769287, 100);

        player.giveWeapon(2210333304, 600, true)
        player.giveWeapon('weapon_sniperrifle', 8, true)

        missionGov.peds.forEach(element => {element.dimension = missionGov.dimension, element.armour = 100});
        missionGov.vehs.forEach(element => {element.dimension = missionGov.dimension})
    }
    
    if (!missionGov.stage3_started) {
        missionGov.peds.forEach(obj => {;            
            let check = missionGov.gunsGived.find(element => {obj == element})
            if (!check) {
                if (obj.netOwner && obj.currentWeapon == 2725352035) {
                    missionGov.gunsGived.push(obj)
                    if (obj == missionGov.peds[5]) {
                        setTimeout(() => {alt.emitClient(obj.netOwner, "pedGW_Gov", obj, true, missionGov.vehs[0])}, 250)
                    } else {
                        setTimeout(() => {alt.emitClient(obj.netOwner, "pedGW_Gov", obj, false)}, 250)
                    }
                }
            }
        })
        if (missionGov.gunsGived.length == 9) {
            missionGov.stage3_started = true
        }
    }

    if (missionGov.stage3_started) {
        alt.emitClient(player, "missionGovStage3")
    }
})

alt.onClient("finish_stage3", (player) => {
    if (!missionGov.stage3_finish) {
        const alivePeds = missionGov.peds.filter(element => !missionGov.pedsDied.includes(element))
        if (alivePeds.length > 0) {
            alivePeds.forEach(obj => {
                if (obj.health == 0) {
                    missionGov.pedsDied.push(obj)
                }
            })
        } else {
            missionGov.stage3_finish = true;
        }
    } else {
        alt.emitClient(player, "finish_2stage3")
    }
})

alt.onClient("start_stage4", (player) => {
    if (!missionGov.blip) {
        alt.emitClient(player, "stage4_blip", missionGov.vehs[0])
    }
})

alt.onClient("missionGov_end", (player) => {
    const helli = new alt.Vehicle("polmav", -1095.3310546875, -835.0902709960938, 36.675384521484375, 0, 0, -0.9299018979072571, 1000);
    helli.dimension = missionGov.dimension;
})

alt.onClient("misiionGovSwitchFloor", (player, player2, floor) => {
    if (!missionGov.swapedFloor) {
        if (floor == 2) {
            player2.pos = {x: -1112.5565185546875,y: -848.3710327148438,z: 13.440711975097656}
            player2.rot = {x: 0, y: 0, z: 2.3256776332855225 } 
        }
        if (floor == 1) {
            player2.pos = {x: -1107.1121826171875,y: -832.6088256835938,z: 37.67536544799805 };
            player2.rot = { x: 0, y: 0, z: -2.42341685295105 };
        }
        missionGov.swapedFloor = true;
        setTimeout(() => {missionGov.swapedFloor = false}, 500)
    }

})

alt.on("playerSpawn", (player) => {
    const myPlayer = player;

    player.emit("spawn")
});