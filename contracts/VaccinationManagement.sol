// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// v1.0.0 : 1명의 예방접종 주기에 대한 개발진행

contract VaccinationManagement {
    // MARK: - 구조체 정의
    // 건강 정보
    // 소수점 지원이 안되는 것을 고려하여 *100 진행을 하여 값을 저장해야 함.
    // 섞어서 사용하는 것 보다 맞추는게 더 효율적으로 메모리 관리 가능
    // ex. 10170 => 101.70 cm
    // ex. 683 => 6.83 kg
    // ex. 150 => 1.5
    // ex. 200 => 2.0
    struct HealthInformation {
        uint16 height;
        uint16 weight;
        uint16 visionL;
        uint16 visionR;
    }

    enum VaccinationStatus {
        Pending,
        Completed
    }
    // 예방접종 구조체
    struct Vaccination {
        uint8 index; // 백신의 인덱스 저장 (중첩 안됨)
        string vaccineName; // 백신이름
        uint8 vaccineChapter; // 백신 차수
        uint8 recommendedAge; // 권장접종나이 (개월로 반푤)
        uint8 daysUntilVaccination; // 백신까지 남은 일수
        VaccinationStatus status; // 접종상태 (대기 중, 완료)
        uint256 administeredDate; // 접종 완료 일자
    }

    // 진료 기록
    enum MedicalType {
        Outpatient, // 외래
        Emergency, // 응급
        Inpatient, // 입원
        Examination // 검사
    }
    struct MedicalHistory {
        uint16 index;
        uint256 timestamp;
        string diagnosis; // 진료 내용
        string perscription; // 처방 내용 (처방 내역에 대한 관리)
        MedicalType medicalType; // 진료 유형
        string visitedHospital; // 방문한 병원
        string doctorName; // 의사 이름
        uint256 cost; // 병원 비용
        bool usedInsurance; // 보험 사용 여부
    }

    // 자식 구조체
    struct Child {
        address childAddress; // 아이의 주소
        string name; // 아이의 이름
        uint256 birthDate; // 아이의 생일
        uint16 babyMonth; // 개월 수
        HealthInformation healthInformation; // 건강정보 저장
        Vaccination[] vaccinations; // 예방 접종 종류
        MedicalHistory[] medicalHistory; // 진료 내역 저장
    }

    // 권장 예방접종 목록 저장 배열
    Vaccination[] public recommendedVaccinations;

    mapping(address => Child[]) private parentToChild;
    mapping(address => address) private childToParent;

    // 이벤트 추가
    event ChildAdded(address indexed parent, address childAddress);
    event VaccinationUpdated(
        address indexed childAddress,
        string vaccineName,
        uint256 date
    );

    // MARK: - 생성자
    // 해당 컨트랙트가 만들어질 떄, 백신에 대한 정보 저장
    constructor() {
        _addVaccination(1, "vaccine1", 1, 0);
        _addVaccination(2, "vaccine1", 2, 0);
    }

    // MARK: - 내부 함수
    // 새로운 접종을 권장 목록에 추가하는 내부 함수
    // 테스트 완료
    function _addVaccination(
        uint8 _index,
        string memory _vaccineName,
        uint8 _chapter,
        uint8 _recommendedAge
    ) public {
        recommendedVaccinations.push(
            Vaccination({
                index: _index,
                vaccineName: _vaccineName,
                vaccineChapter: _chapter,
                recommendedAge: _recommendedAge,
                daysUntilVaccination: 0,
                status: VaccinationStatus.Pending,
                administeredDate: 0
            })
        );
    }

    // 아이의 주소 생성
    // 테스트 완료
    function _generateChildAddress(
        string memory _name,
        uint256 _birthDate
    ) private view returns (address) {
        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(msg.sender, _name, _birthDate)
                        )
                    )
                )
            );
    }

    function _getDaysInMonth(
        uint256 month,
        uint256 year
    ) internal pure returns (uint256) {
        if (month == 2) {
            return _isLeapYear(year) ? 29 : 28;
        } else if (month <= 7) {
            return (month % 2 == 0) ? 30 : 31;
        } else {
            return (month % 2 == 0) ? 31 : 30;
        }
    }

    function _isLeapYear(uint256 year) internal pure returns (bool) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }

    function _unixToYYYYMMDD(uint256 unixTime) internal pure returns (uint256) {
        uint256 secondsInADay = 86400; // 하루의 초 수
        uint256 totalDays = unixTime / secondsInADay; // 총 일수
        uint256 year = 1970; // 시작 연도
        uint256 daysInYear;

        // 연도 계산
        while (totalDays >= (daysInYear = _isLeapYear(year) ? 366 : 365)) {
            totalDays -= daysInYear;
            year++;
        }

        // 월과 일 계산
        uint256 month = 1;
        uint256 day;

        // 각 월의 일수
        while (true) {
            uint256 daysInMonth = _getDaysInMonth(month, year);
            if (totalDays < daysInMonth) {
                day = totalDays + 1; // 1-indexed로 변환
                break;
            }
            totalDays -= daysInMonth;
            month++;
        }

        // YYYYMMDD 형식으로 변환
        return (year * 10000) + (month * 100) + day;
    }

    // 자식의 나이를 계산하는 함수 (리턴하는 값은 개월 수로 리턴이 됨)
    function _caculateBabyMonth(
        uint256 birthDate
    ) internal view returns (uint16) {
        require(
            birthDate <= block.timestamp,
            "Birth date must be in the past."
        ); // Check if birth date is valid

        // Convert current time to YYYYMMDD
        uint256 today = _unixToYYYYMMDD(block.timestamp);

        // Extract year, month, and day from birthDate and today
        uint256 yearToday = today / 10000;
        uint256 monthToday = (today / 100) % 100;
        uint256 dayToday = today % 100;

        uint256 yearBirth = birthDate / 10000;
        uint256 monthBirth = (birthDate / 100) % 100;
        uint256 dayBirth = birthDate % 100;

        // Calculate differences
        require(yearToday >= yearBirth, "Year difference invalid."); // Ensures today is later than birth year

        uint16 totalMonths = uint16(
            (yearToday - yearBirth) * 12 + (monthToday - monthBirth)
        );

        // Adjust for day of month
        if (dayToday < dayBirth) {
            totalMonths -= 1; // Not a full month
        }

        return totalMonths; // Ensure this is within uint8 range (0-255)
    }

    // MARK: - 업데이트 함수

    // 자식의 나이를 업데이트하는 함수
    // 나이를 업데이트할 때 동시에 백신 일정도 같이 업데이트가 진행
    function updateAllChildrenAges() public {
        Child[] storage childrens = parentToChild[msg.sender];
        require(childrens.length != 0, "Children not Found for the parent");

        for (uint i = 0; i < childrens.length; i++) {
            childrens[i].babyMonth = _caculateBabyMonth(childrens[i].birthDate);
        }

        return;
    }

    // MARK: - 정보 리턴 함수

    // 자식의 정보를 리턴하는 함수
    // 해당 데이터에 예방접종과 관련된 정보는 모두 포함
    // 테스트 완료
    function returnChildInformation() public view returns (Child[] memory) {
        return parentToChild[msg.sender];
    }

    // 아이 생성 및 부모 연동
    // 테스트 완료
    function addChild(string memory _name, uint256 _birthDate) public {
        address childAddress = _generateChildAddress(_name, _birthDate);

        // 부모 -> 자식 관계 정의
        Child storage newChild = parentToChild[msg.sender].push();
        newChild.childAddress = childAddress;
        newChild.name = _name;
        newChild.birthDate = _birthDate;
        newChild.babyMonth = _caculateBabyMonth(_birthDate);

        // 자식의 나이에 따라서 백신의 남은 일수도 같이 업데이트가 되어야 함. (수정 필요)
        for (uint i = 0; i < recommendedVaccinations.length; i++) {
            newChild.vaccinations.push(recommendedVaccinations[i]);
        }

        // 자식 주소를 통해서 부모 확인하기
        childToParent[childAddress] = msg.sender;

        emit ChildAdded(msg.sender, childAddress);
    }

    // 백신 접종 기록 추가
    // 테스트 완료
    function updateChildVaccination(
        string memory _name,
        string memory _vaccineName
    ) external {
        // 자식이 확인이 되지 않으면 에러를 발생
        require(parentToChild[msg.sender].length != 0, "empty child");

        Child[] storage childrens = parentToChild[msg.sender];
        require(childrens.length != 0, "empty child");

        // 부모의 주소를 기반으로 자식의 정보를 가져옴
        // 자식의 이름이 동일한 경우에 대해서 해당 백신에 대한 예방 접종을 관리
        for (uint i = 0; i < childrens.length; i++) {
            if (
                keccak256(abi.encodePacked(childrens[i].name)) ==
                keccak256(abi.encodePacked(_name))
            ) {
                for (uint j = 0; j < childrens[i].vaccinations.length; j++) {
                    if (
                        keccak256(
                            abi.encodePacked(
                                childrens[i].vaccinations[j].vaccineName
                            )
                        ) == keccak256((abi.encodePacked(_vaccineName)))
                    ) {
                        // 자식이 이미 맞은 백신인 경우에 대해서 에러를 발생
                        require(
                            childrens[i].vaccinations[j].status ==
                                VaccinationStatus.Pending,
                            "already vaccination completed"
                        );

                        // 자식의 개월 수가 권장 접종 나이 이상인지를 확인
                        require(
                            childrens[i].babyMonth >=
                                childrens[i].vaccinations[j].recommendedAge,
                            "child not old enough for this vaccination"
                        );

                        // 백신 상태를 Pending -> Complete로 변경
                        childrens[i].vaccinations[j].status = VaccinationStatus
                            .Completed;

                        // 백신 접종 날짜를 업데이트
                        childrens[i].vaccinations[j].administeredDate = block
                            .timestamp;

                        // 백신 접종 이벤트에 대해서 이벤트 생성
                        emit VaccinationUpdated(
                            childrens[i].childAddress,
                            _vaccineName,
                            block.timestamp
                        );

                        return;
                    }
                }
            }
        }
    }
}
