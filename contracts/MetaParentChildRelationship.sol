// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./HealthInformation.sol";
import "./MedicalHistory.sol";
import "./VaccinationManagement.sol";

contract ParentChildRelationshipWithMeta {
    using ECDSA for bytes32;

    HealthInformation public healthInformationContract;
    MedicalHistory public medicalHistoryContract;
    VaccinationManagement public vaccinationManagementContract;

    address public owner;
    mapping(address => uint256) public nonces;

    struct Child {
        address childAddress;
        string name;
        uint256 birthDate;
    }

    mapping(address => Child[]) private parentToChild;
    mapping(address => address[]) private childToParent;

    event CreateChild(address indexed parentAddress, address childAddress);
    event ConnectChild(
        address indexed parentAddress,
        address indexed childAddress
    );

    // EIP-712 타입해시 정의
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

    bytes32 private constant CREATE_CHILD_TYPEHASH =
        keccak256(
            "CreateChild(address parent,string name,uint256 birthDate,uint16 height,uint16 weight,uint256 nonce)"
        );

    bytes32 private constant CONNECT_CHILD_TYPEHASH =
        keccak256(
            "ConnectChild(address parent,address childAddress,uint256 nonce)"
        );

    bytes32 private constant SET_HEALTH_INFO_TYPEHASH =
        keccak256(
            "SetHealthInfo(address parent,address childAddress,uint16 height,uint16 weight,uint256 nonce)"
        );

    bytes32 private constant ADD_MEDICAL_HISTORY_TYPEHASH =
        keccak256(
            "AddMedicalHistory(address parent,address childAddress,uint8 medicalType,string visitedName,string timestamp,string doctorName,string symptoms,string diagnosisDetails,uint256 nonce)"
        );

    bytes32 private constant UPDATE_VACCINATION_TYPEHASH =
        keccak256(
            "UpdateVaccination(address parent,address childAddress,string vaccineName,uint256 nonce)"
        );

    bytes32 private constant UPDATE_MULTIPLE_VACCINATION_TYPEHASH =
        keccak256(
            "UpdateMultipleVaccination(address parent,address childAddress,string[] vaccineNames,uint256 nonce)"
        );

    constructor(
        address _healthInformationContractAddress,
        address _medicalHistoryContractAddress,
        address _vaccinationManagementContractAddress
    ) {
        owner = msg.sender;
        healthInformationContract = HealthInformation(
            _healthInformationContractAddress
        );
        medicalHistoryContract = MedicalHistory(_medicalHistoryContractAddress);
        vaccinationManagementContract = VaccinationManagement(
            _vaccinationManagementContractAddress
        );
    }

    function getDomainSeparator() public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    DOMAIN_TYPEHASH,
                    keccak256(bytes("ParentChildRelationshipWithMeta")),
                    keccak256(bytes("1")),
                    block.chainid,
                    address(this)
                )
            );
    }

    // 메타트랜잭션: CreateChild
    function executeMetaCreateChild(
        address parent,
        string memory name,
        uint256 birthDate,
        uint16 height,
        uint16 weight,
        // string[] memory vaxs,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(
            msg.sender == owner,
            "Only owner can execute meta transactions"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                getDomainSeparator(),
                keccak256(
                    abi.encode(
                        CREATE_CHILD_TYPEHASH,
                        parent,
                        keccak256(bytes(name)),
                        birthDate,
                        height,
                        weight,
                        // keccak256(abi.encode(vaxs)),
                        nonces[parent]++
                    )
                )
            )
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer == parent, "Invalid signature");

        address childAddress = address(
            uint160(
                uint256(keccak256(abi.encodePacked(parent, name, birthDate)))
            )
        );

        Child storage newChild = parentToChild[parent].push();
        newChild.childAddress = childAddress;
        newChild.name = name;
        newChild.birthDate = birthDate;

        childToParent[childAddress].push(parent);

        HealthInformation.Information memory information = HealthInformation
            .Information(height, weight);
        healthInformationContract.setHealthInformation(
            childAddress,
            information
        );

        // vaccinationManagementContract.initializeVaccinationRecords(
        //     childAddress
        // );
        // vaccinationManagementContract.updateMultipleChildVaccination(
        //     childAddress,
        //     vaxs
        // );

        emit CreateChild(parent, childAddress);
    }

    // 메타트랜잭션: ConnectChild
    function executeMetaConnectChild(
        address parent,
        address childAddress,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(
            msg.sender == owner,
            "Only owner can execute meta transactions"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                getDomainSeparator(),
                keccak256(
                    abi.encode(
                        CONNECT_CHILD_TYPEHASH,
                        parent,
                        childAddress,
                        nonces[parent]++
                    )
                )
            )
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer == parent, "Invalid signature");

        // 아이의 주소를 기반으로 해서 부모가 있는지를 확인함.
        require(childToParent[childAddress].length != 0, "child not found");
        Child[] storage child = parentToChild[parent];

        for (uint i = 0; i < child.length; i++) {
            require(
                child[i].childAddress != childAddress,
                "Already linked to this child"
            );
        }

        address originalParent = childToParent[childAddress][0];
        uint childIndex = _findChildIndex(originalParent, childAddress);

        Child storage connChild = parentToChild[originalParent][childIndex];
        parentToChild[parent].push(connChild);
        childToParent[childAddress].push(parent);

        emit ConnectChild(parent, childAddress);
    }

    // 메타트랜잭션: SetHealthInformation
    function executeMetaSetHealthInformation(
        address parent,
        address childAddress,
        uint16 height,
        uint16 weight,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(
            msg.sender == owner,
            "Only owner can execute meta transactions"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                getDomainSeparator(),
                keccak256(
                    abi.encode(
                        SET_HEALTH_INFO_TYPEHASH,
                        parent,
                        childAddress,
                        height,
                        weight,
                        nonces[parent]++
                    )
                )
            )
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer == parent, "Invalid signature");

        HealthInformation.Information memory information = HealthInformation
            .Information(height, weight);
        healthInformationContract.setHealthInformation(
            childAddress,
            information
        );
    }

    // 메타트랜잭션: AddMedicalHistory
    function executeMetaAddMedicalHistory(
        address parent,
        address childAddress,
        MedicalHistory.MedicalType medicalType,
        string memory visitedName,
        string memory timestamp,
        string memory doctorName,
        string memory symptoms,
        string memory diagnosisDetails,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(
            msg.sender == owner,
            "Only owner can execute meta transactions"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                getDomainSeparator(),
                keccak256(
                    abi.encode(
                        ADD_MEDICAL_HISTORY_TYPEHASH,
                        parent,
                        childAddress,
                        uint8(medicalType),
                        keccak256(bytes(visitedName)),
                        keccak256(bytes(timestamp)),
                        keccak256(bytes(doctorName)),
                        keccak256(bytes(symptoms)),
                        keccak256(bytes(diagnosisDetails)),
                        nonces[parent]++
                    )
                )
            )
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer == parent, "Invalid signature");

        medicalHistoryContract.addMedicalHistory(
            childAddress,
            medicalType,
            visitedName,
            timestamp,
            doctorName,
            symptoms,
            diagnosisDetails
        );
    }

    // 메타트랜잭션: UpdateVaccination
    function executeMetaUpdateVaccination(
        address parent,
        address childAddress,
        string memory vaccineName,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(
            msg.sender == owner,
            "Only owner can execute meta transactions"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                getDomainSeparator(),
                keccak256(
                    abi.encode(
                        UPDATE_VACCINATION_TYPEHASH,
                        parent,
                        childAddress,
                        keccak256(bytes(vaccineName)),
                        nonces[parent]++
                    )
                )
            )
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer == parent, "Invalid signature");

        vaccinationManagementContract.updateChildVaccination(
            childAddress,
            vaccineName
        );
    }

    // 메타트랜잭션: UpdateMultipleVaccination
    function executeMetaUpdateMultipleVaccination(
        address parent,
        address childAddress,
        string[] memory vaccineNames,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(
            msg.sender == owner,
            "Only owner can execute meta transactions"
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                getDomainSeparator(),
                keccak256(
                    abi.encode(
                        UPDATE_MULTIPLE_VACCINATION_TYPEHASH,
                        parent,
                        childAddress,
                        keccak256(abi.encode(vaccineNames)),
                        nonces[parent]++
                    )
                )
            )
        );

        address signer = ecrecover(digest, v, r, s);
        require(signer == parent, "Invalid signature");

        vaccinationManagementContract.updateMultipleChildVaccination(
            childAddress,
            vaccineNames
        );
    }

    // 읽기 전용 함수들은 메타트랜잭션이 필요 없음
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

    function getHealthInformation(
        address _childAddress
    ) public view returns (HealthInformation.Information memory) {
        return healthInformationContract.getHealthInformation(_childAddress);
    }

    function returnChildInformation() public view returns (Child[] memory) {
        return parentToChild[msg.sender];
    }

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

        revert("child with the given name not found");
    }

    function getMedicalHistoriesForChild(
        address _childAddress
    ) public view returns (MedicalHistory.History[] memory) {
        return medicalHistoryContract.getMedicalHistories(_childAddress);
    }

    function returnChildVaccinationStatus(
        address _childAddress
    ) public view returns (VaccinationManagement.VaccinationInfomation memory) {
        return
            vaccinationManagementContract.returnChildVaccinationStatus(
                _childAddress
            );
    }

    function getVaccinationDDay(
        address _childAddress,
        uint256 _childBirthDate
    ) public view returns (VaccinationManagement.VaccinationWithDDay[] memory) {
        return
            vaccinationManagementContract.getVaccinationDDay(
                _childAddress,
                _childBirthDate
            );
    }

    // 논스 조회
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
}
