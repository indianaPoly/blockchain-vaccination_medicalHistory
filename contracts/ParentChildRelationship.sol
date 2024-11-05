// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/DateUtils.sol";

import "./HealthInformation.sol";
import "./MedicalHistory.sol";
import "./VaccinationManagement.sol";

contract ParentChildRelationship {
    HealthInformation public healthInformationContract;
    MedicalHistory public medicalHistoryContract;
    VaccinationManagement public vaccinationManagementContract;

    struct Child {
        address childAddress; // 아이의 주소
        string name; // 아이의 이름
        uint256 birthDate; // 생년월일
    }

    // 부모의 주소가 자식들을 가리킴
    mapping(address => Child[]) private parentToChild;
    // 아이의 주소가 부모 (최대 2명)을 가리킴
    mapping(address => address[]) private childToParent;

    // 자식이 생성되었을 때 이벤트
    event CreateChild(address indexed parentAddress, address childAddress);

    // 자식과 부모의 연동되었을 때 이벤트
    event ConnectChild(
        address indexed parentAddress,
        address indexed childAddress
    );

    constructor(
        address _healthInformationContractAddress,
        address _medicalHistoryContractAddress,
        address _vaccinationManagementContractAddress
    ) {
        healthInformationContract = HealthInformation(
            _healthInformationContractAddress
        );

        medicalHistoryContract = MedicalHistory(_medicalHistoryContractAddress);

        vaccinationManagementContract = VaccinationManagement(
            _vaccinationManagementContractAddress
        );
    }

    // 아이의 index를 찾아주는 함수
    function _findChildIndex(
        address parentAddress,
        address _childAddress
    ) internal view returns (uint) {
        Child[] storage children = parentToChild[parentAddress];
        for (uint index = 0; index < children.length; index++) {
            if (children[index].childAddress == _childAddress) {
                return index;
            }
        }
        revert("Child not found");
    }

    // 아이 생성하는 함수
    function createChild(
        string memory _name,
        uint256 _birthDate,
        uint16 _height,
        uint16 _weight,
        string[] memory vaxs
    ) public returns (address) {
        require(msg.sender != address(0), "parent not found");
        address childAddress = address(
            uint160(
                uint256(
                    keccak256(abi.encodePacked(msg.sender, _name, _birthDate))
                )
            )
        );

        // 부모와 자식을 연결함.
        Child storage newChild = parentToChild[msg.sender].push();
        newChild.childAddress = childAddress;
        newChild.name = _name;
        newChild.birthDate = _birthDate;

        childToParent[childAddress].push(msg.sender);

        // 초기 몸무게를 지정함
        HealthInformation.Information memory information = HealthInformation
            .Information(_height, _weight);
        healthInformationContract.setHealthInformation(
            childAddress,
            information
        );

        // 초기 백신 상태를 만들어둠.
        vaccinationManagementContract.initializeVaccinationRecords(
            childAddress
        );

        // 백신 상태 동기화 진행
        vaccinationManagementContract.updateMultipleChildVaccination(
            childAddress,
            vaxs
        );

        emit CreateChild(msg.sender, childAddress);

        // 아이를 정상적으로 생성하고 나면 주소를 리턴
        return childAddress;
    }

    // 아이와 부모를 연동하는 함수
    function connectChild(address _childAddress) external {
        require(childToParent[_childAddress].length != 0, "child not found");

        Child[] storage child = parentToChild[msg.sender];

        // 아이 주소가 이미 연동이 되어있는지를 확인
        for (uint i = 0; i < child.length; i++) {
            require(
                child[i].childAddress != _childAddress,
                "Already linked to this child"
            );
        }

        address originalParent = childToParent[_childAddress][0];
        uint childIndex = _findChildIndex(originalParent, _childAddress);

        // 자녀 정보 가져와서 새로운 부모와 연결
        Child storage connChild = parentToChild[originalParent][childIndex];
        parentToChild[msg.sender].push(connChild);

        // 자녀와 부모 간의 관계 업데이트
        childToParent[_childAddress].push(msg.sender);

        emit ConnectChild(msg.sender, _childAddress);
    }

    // 아이의 건강 정보를 업데이트 하는 함수 (보안적인 측면이 들어가야 함.)
    function setHealthInformation(
        address _childAddress,
        uint16 _height,
        uint16 _weight
    ) public {
        HealthInformation.Information memory information = HealthInformation
            .Information(_height, _weight);
        healthInformationContract.setHealthInformation(
            _childAddress,
            information
        );
    }

    // 아이의 건강 정보를 리턴하는 함수 (보안적인 측면이 들어가야 함.)
    function getHealthInformation(
        address _childAddress
    ) public view returns (HealthInformation.Information memory) {
        return healthInformationContract.getHealthInformation(_childAddress);
    }

    // 모든 자식의 정보를 리턴하는 함수
    function returnChildInformation() public view returns (Child[] memory) {
        return parentToChild[msg.sender];
    }

    // 자식의 이름에 따른 주소를 리턴하는 함수
    function returnChildAddress(
        string memory _name
    ) public view returns (address) {
        Child[] storage childs = parentToChild[msg.sender];
        uint numOfChilds = childs.length;

        require(numOfChilds > 0, "No child found");

        for (uint index = 0; index < numOfChilds; index++) {
            if (
                keccak256(abi.encodePacked(childs[index].name)) ==
                keccak256(abi.encodePacked(_name))
            ) {
                return childs[index].childAddress;
            }
        }

        revert("child with the give name not found");
    }

    // 진료 내역을 추가하는 함수
    function addMedicalHistoryForChild(
        address _childAddress,
        MedicalHistory.MedicalType _medicalType, // MedicalHistory.sol에서 가져온 enum 사용
        string memory _visitedName,
        string memory _timestamp,
        string memory _doctorName,
        string memory _symptoms,
        string memory _diagnosisDetails
    ) public {
        // MedicalHistory 컨트랙트의 addMedicalHistory 함수 호출
        medicalHistoryContract.addMedicalHistory(
            _childAddress,
            _medicalType,
            _visitedName,
            _timestamp,
            _doctorName,
            _symptoms,
            _diagnosisDetails
        );
    }

    function getMedicalHistoriesForChild(
        address _childAddress
    ) public view returns (MedicalHistory.History[] memory) {
        return medicalHistoryContract.getMedicalHistories(_childAddress);
    }
}
