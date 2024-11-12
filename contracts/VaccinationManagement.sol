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
        VaccinationStatus status; // 접종상태 (대기 중, 완료)
        uint256 administeredDate; // 접종 완료 일자
    }

    // 백신상태 정보를 담는 구조체
    struct VaccinationInfomation {
        Vaccination[] completed;
        Vaccination[] pending;
    }

    struct VaccinationInput {
        string vaccineName;
        uint8 vaccineChapter;
        uint256 administerDate;
    }

    // 권장 예방접종 목록 저장 배열
    Vaccination[] public recommendedVaccinations;

    // 자녀 주소를 기준으로 예방 접종 기록을 저장
    mapping(address => Vaccination[]) vaccinationRecords;

    // 이벤트 추가
    event VaccinationUpdated(
        address indexed childAddress,
        string vaccineName,
        uint8 vaccineChapter,
        uint256 date
    );

    // 생성자 (끝을 기준으로)
    // 생일 기준으로 하는 것이 아니라 (D-day 보다는 범위를 알려주는 형식으로)
    constructor() {
        // 0개월 ~ 1개월
        _addVaccination(1, "BCG", unicode"결핵", 1, 0, 30);
        _addVaccination(2, "HepB", unicode"B형간염", 1, 0, 30);

        // 1개월
        _addVaccination(3, "HepB", unicode"B형간염", 2, 31, 60);

        // 2개월
        _addVaccination(4, "DTap", unicode"디프테리아", 1, 61, 90);
        _addVaccination(5, "DTap", unicode"파상풍", 1, 61, 90);
        _addVaccination(6, "DTap", unicode"백일해", 1, 61, 90);
        _addVaccination(7, "IPV", unicode"폴리오", 1, 61, 90);
        _addVaccination(8, "Hib", unicode"b형헤모필루스인플루엔자", 1, 61, 90);
        _addVaccination(9, "PCV", unicode"폐렴구균", 1, 61, 90);
        _addVaccination(10, "RV1", unicode"로타바이러스 감염증", 1, 61, 90);
        _addVaccination(11, "RV5", unicode"로타바이러스 감염증", 1, 61, 90);

        // 4개월
        _addVaccination(12, "DTap", unicode"디프테리아", 2, 121, 150);
        _addVaccination(13, "DTap", unicode"파상풍", 2, 121, 150);
        _addVaccination(14, "DTap", unicode"백일해", 2, 121, 150);
        _addVaccination(15, "IPV", unicode"폴리오", 2, 121, 150);
        _addVaccination(
            16,
            "Hib",
            unicode"b형헤모필루스인플루엔자",
            2,
            121,
            150
        );
        _addVaccination(17, "PCV", unicode"폐렴구균", 2, 121, 150);
        _addVaccination(18, "RV1", unicode"로타바이러스 감염증", 2, 121, 150);
        _addVaccination(19, "RV5", unicode"로타바이러스 감염증", 2, 121, 150);

        // 6개월
        _addVaccination(20, "HepB", unicode"B형간염", 3, 181, 210);
        _addVaccination(21, "DTap", unicode"디프테리아", 3, 181, 210);
        _addVaccination(22, "DTap", unicode"파상풍", 3, 181, 210);
        _addVaccination(23, "DTap", unicode"백일해", 3, 181, 210);
        _addVaccination(
            24,
            "Hib",
            unicode"b형헤모필루스인플루엔자",
            3,
            181,
            210
        );
        _addVaccination(25, "PCV", unicode"폐렴구균", 2, 181, 210);
        _addVaccination(26, "RV5", unicode"로타바이러스 감염증", 3, 181, 210);
        _addVaccination(27, "IPV", unicode"폴리오", 3, 181, 570);

        // 12개월
        _addVaccination(
            28,
            "Hib",
            unicode"b형헤모필루스인플루엔자",
            4,
            361,
            480
        );
        _addVaccination(29, "PCV", unicode"폐렴구균", 4, 361, 480);
        _addVaccination(30, "MMR", unicode"홍역", 1, 361, 480);
        _addVaccination(31, "MMR", unicode"유행성이하선염", 1, 361, 480);
        _addVaccination(32, "MMR", unicode"풍진", 1, 361, 480);
        _addVaccination(33, "HepA", unicode"A형간염", 1, 361, 480);
        _addVaccination(34, "IJEV", unicode"일본뇌염", 1, 361, 480);
        _addVaccination(35, "LJEV", unicode"일본뇌염", 1, 361, 720);

        // 15개월
        _addVaccination(36, "DTap", unicode"디프테리아", 4, 451, 570);
        _addVaccination(37, "DTap", unicode"파상풍", 4, 451, 570);
        _addVaccination(38, "DTap", unicode"백일해", 4, 451, 570);

        // 18개월
        _addVaccination(39, "HepA", unicode"A형간염", 2, 541, 720);
        _addVaccination(40, "IJEV", unicode"일본뇌염", 2, 541, 720);

        // 24개월
        _addVaccination(41, "IJEV", unicode"일본뇌염", 3, 721, 1080);
        _addVaccination(42, "LJEV", unicode"일본뇌염", 2, 721, 1080);

        // 48개월 (만 4세) ~ 만 6세 까지
        _addVaccination(43, "DTap", unicode"디프테리아", 5, 1441, 2520);
        _addVaccination(44, "DTap", unicode"파상풍", 5, 1441, 2520);
        _addVaccination(45, "DTap", unicode"백일해", 5, 1441, 2520);

        _addVaccination(46, "IPV", unicode"폴리오", 4, 1441, 2520);

        _addVaccination(47, "MMR", unicode"홍역", 2, 1441, 2520);
        _addVaccination(48, "MMR", unicode"유형성이하선염", 2, 1441, 2520);
        _addVaccination(49, "MMR", unicode"풍진", 2, 1441, 2520);

        // 72개월 (만 6세)
        _addVaccination(50, "IJEV", unicode"일본뇌염", 4, 2161, 2520);

        // 132개월
        _addVaccination(51, "Tdap", unicode"디프테리아", 6, 3961, 4680);
        _addVaccination(52, "Tdap", unicode"파상풍", 6, 3961, 4680);
        _addVaccination(53, "Tdap", unicode"백일해", 6, 3961, 4680);

        // 144개월
        _addVaccination(54, "IJEV", unicode"일본뇌염", 5, 4321, 4680);
        _addVaccination(55, "HPV", unicode"사람유두종바이러스", 1, 4321, 4500);
        _addVaccination(56, "HPV", unicode"사람유두종바이러스", 2, 4501, 4680);
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
                status: VaccinationStatus.Pending,
                administeredDate: 0
            })
        );
    }

    // 백신에 대한 정보가 없다면 초기 설정을 진행함.
    function initializeVaccinationRecords(address _childAddress) external {
        require(_childAddress != address(0), "Invalid address");

        for (uint i = 0; i < recommendedVaccinations.length; i++) {
            vaccinationRecords[_childAddress].push(recommendedVaccinations[i]);
        }
    }

    function updateChildVaccination(
        address _childAddress,
        string memory _vaccineName,
        uint8 _vaccineChapter,
        uint256 _administeredDate
    ) external {
        require(_childAddress != address(0), "Invalid address");
        require(_vaccineChapter > 0, "Invalid chapter");

        Vaccination[] storage vaxs = vaccinationRecords[_childAddress];
        uint count = 0;

        for (uint i = 0; i < vaxs.length; i++) {
            if (
                keccak256(abi.encodePacked(vaxs[i].vaccineName)) ==
                keccak256(abi.encodePacked(_vaccineName)) &&
                vaxs[i].vaccineChapter == _vaccineChapter
            ) {
                vaxs[i].status = VaccinationStatus.Completed;
                vaxs[i].administeredDate = _administeredDate;

                emit VaccinationUpdated(
                    _childAddress,
                    _vaccineName,
                    _vaccineChapter,
                    _administeredDate
                );

                count++;
            }
        }

        require(count > 0, "Vaccine not found for the child");
    }

    // 접종 기록을 업데이트 하는 함수
    function updateMultipleChildVaccination(
        address _childAddress,
        VaccinationInput[] memory _vaccinations
    ) external {
        require(_childAddress != address(0), "Invalid child address");
        require(_vaccinations.length > 0, "Vaccinations required");

        Vaccination[] storage vaxs = vaccinationRecords[_childAddress];

        uint256 updatedCount = 0;

        for (uint i = 0; i < _vaccinations.length; i++) {
            VaccinationInput memory input = _vaccinations[i];
            require(input.vaccineChapter > 0, "Invalid chapter");

            for (uint j = 0; j < vaxs.length; j++) {
                if (
                    keccak256(abi.encodePacked(vaxs[j].vaccineName)) ==
                    keccak256(abi.encodePacked(input.vaccineName)) &&
                    vaxs[j].vaccineChapter <= input.vaccineChapter && // 현재 차수 이하의 모든 차수 처리
                    vaxs[j].status == VaccinationStatus.Pending
                ) {
                    vaxs[j].status = VaccinationStatus.Completed;
                    vaxs[j].administeredDate = 0; // 이거는 수정이 필요 할 듯

                    emit VaccinationUpdated(
                        _childAddress,
                        input.vaccineName,
                        vaxs[j].vaccineChapter,
                        vaxs[j].administeredDate
                    );

                    updatedCount++;
                }
            }
        }

        require(updatedCount > 0, "No vaccinations updated");
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
}
