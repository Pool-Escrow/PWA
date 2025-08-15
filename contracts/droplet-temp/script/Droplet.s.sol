// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ERC20StorageVersioned} from "../src/ERC20StorageVersioned.sol";

contract DropletScript is Script {
    ERC20StorageVersioned public droplet;

    function setUp() public {}

    function run() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        droplet = new ERC20StorageVersioned("DROPLET", "DROP");
        vm.stopBroadcast();
    }

    function runGrantRoles() public {
        vm.createSelectFork("base");
        vm.activeFork();
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        address token = address(0xd8a698486782d0d3fa336C0F8dd7856196C97616);
        address admin = address(0x1234);

        droplet = ERC20StorageVersioned(token);
        droplet.grantRole(droplet.TOKEN_MANAGER_ROLE(), admin);

        vm.stopBroadcast();
        vm.createSelectFork("base_testnet");
        vm.activeFork();
        vm.startBroadcast(vm.envUint("PRIVATE_KEY_TESTNET"));
        token = address(0xc9e3A0b2d65cbb151Fa149608f99791543290d6d);
        admin = address(0x1234);

        droplet = ERC20StorageVersioned(token);
        droplet.grantRole(droplet.TOKEN_MANAGER_ROLE(), admin);
        vm.stopBroadcast();
    }
}
