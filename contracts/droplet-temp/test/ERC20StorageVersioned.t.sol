// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ERC20StorageVersioned} from "../src/ERC20StorageVersioned.sol";

contract ERC20StorageVersionedTest is Test {
    ERC20StorageVersioned public droplet;

    function setUp() public {
        droplet = new ERC20StorageVersioned("Droplet", "DROP");
    }

    function test_increment() public {
        droplet.mint(address(this), 100);
        assertEq(droplet.balanceOf(address(this)), 100);
    }

    function test_burn() public {
        droplet.mint(address(this), 100);
        droplet.burn(address(this), 50);
        assertEq(droplet.balanceOf(address(this)), 50);
    }

    function test_transfer() public {
        droplet.mint(address(this), 100);
        droplet.transfer(address(1), 50);
        assertEq(droplet.totalSupply(), 100);
        assertEq(droplet.balanceOf(address(this)), 50);
        assertEq(droplet.balanceOf(address(1)), 50);
    }

    function test_upgradeStorage() public {
        test_transfer();

        droplet.upgradeStorage("Droplet.storage.version.2");
        assertEq(droplet.totalSupply(), 0);
        assertEq(droplet.balanceOf(address(this)), 0);
        assertEq(droplet.balanceOf(address(1)), 0);

        assertEq(droplet.totalSupply("Droplet.storage.version.1"), 100);
        assertEq(droplet.balanceOf(address(this), "Droplet.storage.version.1"), 50);
        assertEq(droplet.balanceOf(address(1), "Droplet.storage.version.1"), 50);
    }

    function test_permitTransfer() public {
        address alice = vm.addr(uint256(1));
        droplet.mint(address(this), 100);
        droplet.transfer(alice, 50);

        bytes32 domainSeparator = droplet.DOMAIN_SEPARATOR();

        bytes32 structHash = keccak256(
            abi.encode(
                droplet.PERMIT_TYPEHASH(), alice, address(this), 50, droplet.nonces(alice), block.timestamp + 1 days
            )
        );
        bytes32 hash = keccak256(abi.encodePacked(hex"1901", domainSeparator, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(uint256(1), hash);

        droplet.permit(alice, address(this), 50, block.timestamp + 1 days, v, r, s);
        droplet.transferFrom(alice, address(this), 50);
        assertEq(droplet.balanceOf(address(this)), 100);
    }

    function test_upgradeStorage_revert_notAdmin() public {
        vm.prank(address(1));
        vm.expectRevert();
        droplet.upgradeStorage("Droplet.storage.version.2");
    }

    function test_grantRole_mint() public {
        droplet.grantRole(droplet.TOKEN_MANAGER_ROLE(), address(1));
        vm.prank(address(1));
        droplet.mint(address(2), 100);
    }

    function test_mintRevert_withoutRole() public {
        vm.prank(address(1));
        vm.expectRevert();
        droplet.mint(address(2), 100);
    }
}
