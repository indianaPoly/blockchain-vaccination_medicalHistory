// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalHistory {
    enum MedicalType {
        Hospital,
        Pharmacy
    }

    struct History {
        MedicalType medicaltype;
        string visitedName;
        string timestamp;
        string doctorName;
        string symptoms; // 증상
        string diagnosisDetails; // 진단 내용
    }

    mapping(address => History[]) private medicalHistoryRecord;

    event MedicalHistoryAdded(
        address indexed childAddress,
        string timestamp,
        string symptoms
    );

    // 동일한 진료 내역을 방지하는 내부 함수
    function _isDuplicate(
        address _childAddress,
        History memory newRecord
    ) internal view returns (bool) {
        History[] storage records = medicalHistoryRecord[_childAddress];
        for (uint i = 0; i < records.length; i++) {
            bool isSameTimestamp = keccak256(
                abi.encodePacked(records[i].timestamp)
            ) == keccak256(abi.encodePacked(newRecord.timestamp));

            bool isSameSymptoms = keccak256(
                abi.encodePacked(records[i].symptoms)
            ) == keccak256(abi.encodePacked(newRecord.symptoms));

            bool isSameDiagnosisDetails = keccak256(
                abi.encodePacked(records[i].diagnosisDetails)
            ) == keccak256(abi.encodePacked(newRecord.diagnosisDetails));

            if (isSameTimestamp && isSameSymptoms && isSameDiagnosisDetails) {
                return true; // 중복된 진료 기록 존재
            }
        }
        return false;
    }

    // 진료 내역을 추가하는 함수
    function addMedicalHistory(
        address _childAddress,
        MedicalType _medicalType,
        string memory _visitedName,
        string memory _timestamp,
        string memory _doctorName,
        string memory _symptoms,
        string memory _diagnosisDetails
    ) public {
        History memory newRecord = History({
            medicaltype: _medicalType,
            visitedName: _visitedName,
            timestamp: _timestamp,
            doctorName: _doctorName,
            symptoms: _symptoms,
            diagnosisDetails: _diagnosisDetails
        });

        require(
            !_isDuplicate(_childAddress, newRecord),
            "Duplicate medical history record"
        );

        medicalHistoryRecord[_childAddress].push(newRecord);
        emit MedicalHistoryAdded(_childAddress, _timestamp, _symptoms);
    }

    // 특정 자녀의 모든 진료 기록을 조회하는 함수
    function getMedicalHistories(
        address _childAddress
    ) public view returns (History[] memory) {
        return medicalHistoryRecord[_childAddress];
    }
}
