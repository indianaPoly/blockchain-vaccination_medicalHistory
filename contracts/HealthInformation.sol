// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthInformation {
    struct Information {
        uint16 height;
        uint16 weight;
    }

    mapping(address => Information) private healthRecord;

    function setHealthInformation(
        address _childAddress,
        Information memory _healthInfo
    ) public {
        healthRecord[_childAddress] = _healthInfo;
    }

    function getHealthInformation(
        address _childAddress
    ) public view returns (Information memory) {
        return healthRecord[_childAddress];
    }
}
