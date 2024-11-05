// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// v1.0.0 : 1명의 예방접종 주기에 대한 개발진행
contract VaccinationManagement {
    enum VaccinationStatus {
        Pending,
        Completed
    }

    // 예방접종 구조체
    struct Vaccination {
        uint8 index; // 백신의 인덱스 저장 (중첩 안됨)
        string vaccineName; // 백신이름
        string targetDisease; // 백신이 예방하는 대상 질병
        uint8 vaccineChapter; // 백신 차수
        uint16 recommendedDays; // 권장접종 일수 (출생 후 경과일로 표시)
        uint16 recommendedEndDays; // 접종이 가능한 일수의 최대 범위 (출생 후 경과일)
        uint256 startVaccinationDate; // 접종이 가능한 시작일
        uint256 endVaccinationDate; // 접종이 가능한 종료일
        VaccinationStatus status; // 접종상태 (대기 중, 완료)
        uint256 administeredDate; // 접종 완료 일자
    }

    // 백신상태 정보를 담는 구조체
    struct VaccinationInfomation {
        Vaccination[] completed;
        Vaccination[] pending;
    }

    // D-day 정보를 가지고 있는 구조체
    struct VaccinationWithDDay {
        Vaccination vax;
        int256 dDay;
    }

    // 권장 예방접종 목록 저장 배열
    Vaccination[] public recommendedVaccinations;

    // 자녀 주소를 기준으로 예방 접종 기록을 저장
    mapping(address => Vaccination[]) vaccinationRecords;

    // 이벤트 추가
    event VaccinationUpdated(
        address indexed childAddress,
        string vaccineName,
        uint256 date
    );

    // 생성자
    constructor() {
        _addVaccination(1, "BCG", unicode"결핵", 1, 0, 30);
        _addVaccination(2, "HepB", unicode"B형간염", 1, 0, 30);
        _addVaccination(3, "HepB", unicode"B형간염", 2, 30, 60);
        _addVaccination(
            4,
            "DTap",
            unicode"디프테리아 파상풍 백일해",
            1,
            60,
            90
        );
        _addVaccination(5, "IPV", unicode"폴리오", 1, 60, 90);
        _addVaccination(6, "Hib", unicode"b형헤모필루스인플루엔자", 1, 60, 90);
        _addVaccination(7, "PCV", unicode"폐렴구균", 1, 60, 90);
        _addVaccination(8, "RV1", unicode"로타바이러스 감염증", 1, 60, 90);
        _addVaccination(9, "RV5", unicode"로타바이러스 감염증", 1, 60, 90);
        _addVaccination(
            10,
            "DTap",
            unicode"디프테리아 파상풍 백일해",
            2,
            120,
            150
        );
        _addVaccination(11, "IPV", unicode"폴리오", 2, 120, 150);
        _addVaccination(
            12,
            "Hib",
            unicode"b형헤모필루스인플루엔자",
            2,
            120,
            150
        );
        _addVaccination(13, "PCV", unicode"폐렴구균", 2, 120, 150);
        _addVaccination(14, "RV1", unicode"로타바이러스 감염증", 2, 120, 150);
        _addVaccination(18, "RV5", unicode"로타바이러스 감염증", 2, 120, 150);
        _addVaccination(19, "HepB", unicode"B형간염", 3, 180, 210);
        _addVaccination(
            20,
            "DTap",
            unicode"디프테리아 파상풍 백일해",
            3,
            180,
            210
        );
        _addVaccination(
            22,
            "Hib",
            unicode"b형헤모필루스인플루엔자",
            3,
            180,
            210
        );
        _addVaccination(23, "PCV", unicode"폐렴구균", 2, 180, 210);
        _addVaccination(24, "RV5", unicode"로타바이러스 감염증", 3, 180, 210);
    }

    // 권장 예방 접종 목록에 백신 추가
    function _addVaccination(
        uint8 _index,
        string memory _vaccineName,
        string memory _targetDisease,
        uint8 _chapter,
        uint16 _recommendedDays,
        uint16 _recommendedEndDays
    ) internal {
        recommendedVaccinations.push(
            Vaccination({
                index: _index,
                vaccineName: _vaccineName,
                targetDisease: _targetDisease,
                vaccineChapter: _chapter,
                recommendedDays: _recommendedDays,
                recommendedEndDays: _recommendedEndDays,
                startVaccinationDate: 0,
                endVaccinationDate: 0,
                status: VaccinationStatus.Pending,
                administeredDate: 0
            })
        );
    }

    // mapping에 저장하도록 설정
    function initializeVaccinationRecords(address _childAddress) external {
        require(_childAddress != address(0), "Invalid address");

        for (uint i = 0; i < recommendedVaccinations.length; i++) {
            vaccinationRecords[_childAddress].push(recommendedVaccinations[i]);
        }
    }

    // 자녀의 예방 접종 상태 조회
    function returnChildVaccinationStatus(
        address _childAddress
    ) public view returns (VaccinationInfomation memory) {
        require(_childAddress != address(0), "Invalid address");

        Vaccination[] storage vaxs = vaccinationRecords[_childAddress];
        uint completedCount = 0;
        uint pendingCount = 0;

        // 상태별로 개수 카운트
        for (uint i = 0; i < vaxs.length; i++) {
            if (vaxs[i].status == VaccinationStatus.Completed) {
                completedCount++;
            } else if (vaxs[i].status == VaccinationStatus.Pending) {
                pendingCount++;
            }
        }

        // VaccinationInfomation 구조체에 상태별 배열 크기 할당
        VaccinationInfomation memory vaxInfo;
        vaxInfo.completed = new Vaccination[](completedCount);
        vaxInfo.pending = new Vaccination[](pendingCount);

        uint completedIndex = 0;
        uint pendingIndex = 0;

        // 상태별로 배열에 추가
        for (uint i = 0; i < vaxs.length; i++) {
            if (vaxs[i].status == VaccinationStatus.Completed) {
                vaxInfo.completed[completedIndex] = vaxs[i];
                completedIndex++;
            } else if (vaxs[i].status == VaccinationStatus.Pending) {
                vaxInfo.pending[pendingIndex] = vaxs[i];
                pendingIndex++;
            }
        }

        return vaxInfo;
    }

    // 접종 기록을 업데이트 하는 함수
    function updateMultipleChildVaccination(
        address _childAddress,
        string[] memory _vaccinNames
    ) external {
        require(_childAddress != address(0), "Invalid child address");
        require(_vaccinNames.length > 0, "vaccine names required");

        Vaccination[] storage vaxs = vaccinationRecords[_childAddress];
        bool updated = false;

        for (uint j = 0; j < _vaccinNames.length; j++) {
            string memory vaccineName = _vaccinNames[j];

            for (uint i = 0; i < vaxs.length; i++) {
                Vaccination storage vax = vaxs[i];

                if (
                    keccak256(abi.encodePacked(vax.vaccineName)) ==
                    keccak256(abi.encodePacked(vaccineName))
                ) {
                    if (vax.status == VaccinationStatus.Pending) {
                        vax.status = VaccinationStatus.Completed;
                        vax.administeredDate = block.timestamp; // 이거는 수정이 필요 할 듯

                        updated = true;
                    }
                }
            }
        }

        require(updated || _vaccinNames.length == 0, "No vaccinations updated");
    }

    // 자녀의 예방 접종 기록 업데이트
    function updateChildVaccination(
        address _childAddress,
        string memory _vaccineName
    ) external {
        require(_childAddress != address(0), "Invalid address");

        Vaccination[] storage vaxs = vaccinationRecords[_childAddress];
        for (uint i = 0; i < vaxs.length; i++) {
            Vaccination storage vax = vaxs[i];

            if (
                keccak256(abi.encodePacked(vax.vaccineName)) ==
                keccak256(abi.encodePacked(_vaccineName))
            ) {
                require(
                    vax.status == VaccinationStatus.Pending,
                    "Vaccination already completed"
                );

                vax.status = VaccinationStatus.Completed;
                vax.administeredDate = block.timestamp; // 접종 완료 일자 추가
                emit VaccinationUpdated(
                    _childAddress,
                    _vaccineName,
                    block.timestamp
                );
                return;
            }
        }

        revert("Vaccine not found for the child");
    }

    // d-day return 하는 함수
    function getVaccinationDDay(
        address _childAddress,
        uint256 _childBirthDate
    ) public view returns (VaccinationWithDDay[] memory) {
        require(_childAddress != address(0), "Invalid child address");

        Vaccination[] storage vaxs = vaccinationRecords[_childAddress];
        uint pendingCount = 0;

        // Pending 상태 백신 개수 확인
        for (uint i = 0; i < vaxs.length; i++) {
            if (vaxs[i].status == VaccinationStatus.Pending) {
                pendingCount++;
            }
        }

        // 반환할 배열 초기화
        VaccinationWithDDay[]
            memory pendingVaccinesWithDDay = new VaccinationWithDDay[](
                pendingCount
            );

        uint index = 0;
        for (uint i = 0; i < vaxs.length; i++) {
            if (vaxs[i].status == VaccinationStatus.Pending) {
                uint256 recommendedStart = _childBirthDate +
                    (vaxs[i].recommendedDays * 1 days);
                int256 dDay;

                // D-day 계산
                if (recommendedStart > block.timestamp) {
                    dDay = int256(
                        (recommendedStart - block.timestamp) / 1 days
                    );
                } else {
                    dDay = 0; // 현재 접종 가능 기간이 시작됨
                }

                // 구조체에 D-day와 백신 정보 추가
                pendingVaccinesWithDDay[index] = VaccinationWithDDay({
                    vax: vaxs[i],
                    dDay: dDay
                });
                index++;
            }
        }

        return pendingVaccinesWithDDay;
    }
}
