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
        string targetDisease; // 백신이 예방하는 대상 질병
        uint8 vaccineChapter; // 백신 차수
        uint8 recommendedAge; // 권장접종나이 (개월로 반푤)
        uint8 recommendedEndAge; // 접종이 가능한 나이의 최대 범위 (개월 단위)
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
    // 자식이 추가 되었을 때 발생되는 이벤트
    event ChildAdded(address indexed parent, address childAddress);

    // 자식의 예방접종이 업데이트가 되었을 때 발생되는 이벤트
    event VaccinationUpdated(
        address indexed childAddress,
        string vaccineName,
        uint256 date
    );

    // 자식과 정상적으로 연동이 되었을 때 발생하는 코드
    event ChildLinkedToParent(
        address indexed parent,
        address indexed childAddress
    );

    // MARK: - 생성자
    // 해당 컨트랙트가 만들어질 떄, 백신에 대한 정보 저장
    // index, 백신종류, 대상 감염병, 차수, 접종 나이, 마감일
    constructor() {
        _addVaccination(1, "BCG", unicode"결핵", 1, 0, 1);
        _addVaccination(2, "HepB", unicode"B형간염", 1, 0, 1);
        _addVaccination(3, "HepB", unicode"B형간염", 2, 1, 2);
        _addVaccination(4, "DTap", unicode"디프테리아 파상풍 백일해", 1, 2, 3);
        _addVaccination(5, "IPV", unicode"폴리오", 1, 2, 3);
        _addVaccination(6, "Hib", unicode"b형헤모필루스인플루엔자", 1, 2, 3);
        _addVaccination(7, "PCV", unicode"폐렴구균", 1, 2, 3);
        _addVaccination(8, "RV1", unicode"로타바이러스 감염증", 1, 2, 3);
        _addVaccination(9, "RV5", unicode"로타바이러스 감염증", 1, 2, 3);
        _addVaccination(10, "DTap", unicode"디프테리아 파상풍 백일해", 2, 4, 5);
        _addVaccination(11, "IPV", unicode"폴리오", 2, 4, 5);
        _addVaccination(12, "Hib", unicode"b형헤모필루스인플루엔자", 2, 4, 5);
        _addVaccination(13, "PCV", unicode"폐렴구균", 2, 4, 5);
        _addVaccination(14, "RV1", unicode"로타바이러스 감염증", 2, 4, 5);
        _addVaccination(18, "RV5", unicode"로타바이러스 감염증", 2, 4, 5);
        _addVaccination(19, "HepB", unicode"B형간염", 3, 6, 7);
        _addVaccination(20, "DTap", unicode"디프테리아 파상풍 백일해", 3, 6, 7);
        // _addVaccination(21, "IPV", unicode"폴리오", 3, 6); , 기간이 존재하는 것에 대해서 어떻게 처리할지 고민해야됨.
        _addVaccination(22, "Hib", unicode"b형헤모필루스인플루엔자", 3, 6, 7);
        _addVaccination(23, "PCV", unicode"폐렴구균", 2, 6, 7);
        _addVaccination(24, "RV5", unicode"로타바이러스 감염증", 3, 6, 7);
        // _addVaccination(2, "DTap", unicode"디프테리아 파상풍 백일해", 4, 6);
    }

    // MARK: - 내부 함수
    // 새로운 접종을 권장 목록에 추가하는 내부 함수
    // 테스트 완료
    function _addVaccination(
        uint8 _index,
        string memory _vaccineName,
        string memory _targetDisease,
        uint8 _chapter,
        uint8 _recommendedAge,
        uint8 _recommendedEndAge
    ) public {
        recommendedVaccinations.push(
            Vaccination({
                index: _index,
                vaccineName: _vaccineName,
                targetDisease: _targetDisease,
                vaccineChapter: _chapter,
                recommendedAge: _recommendedAge,
                recommendedEndAge: _recommendedEndAge,
                startVaccinationDate: 0,
                endVaccinationDate: 0,
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

    function _caculateVaccinationDate(
        uint256 birthDate,
        uint8 monthAfterBirth
    ) internal pure returns (uint256) {
        return birthDate + (monthAfterBirth * 30 days);
    }

    // 자식의 주소로 자식을 찾는 내부 함수
    function _findChildIndex(
        address childAddress
    ) internal view returns (uint) {
        Child[] storage children = parentToChild[childToParent[childAddress]];
        for (uint i = 0; i < children.length; i++) {
            if (children[i].childAddress == childAddress) {
                return i;
            }
        }
        revert("Child not found");
    }

    // MARK: - 정보 리턴 함수

    // 자식의 정보를 리턴하는 함수
    // 해당 데이터에 예방접종과 관련된 정보는 모두 포함 (테스트 완료)
    function returnChildInformation() public view returns (Child[] memory) {
        return parentToChild[msg.sender];
    }

    function returnChildVaccinationStatus(
        string memory _name
    ) public view returns (VaccinationInfomation memory) {
        Child[] storage children = parentToChild[msg.sender];
        require(children.length > 0, "No children found");

        bool childFound = false;
        uint childIndex;
        // 자식의 이름이 있는 경우에 대해서
        for (uint i = 0; i < children.length; i++) {
            if (
                keccak256(abi.encodePacked(children[i].name)) ==
                keccak256(abi.encodePacked(_name))
            ) {
                childFound = true;
                childIndex = i;
                break;
            }
        }

        require(childFound, "child with the given name not found");

        // Completed와 Pending 배열의 크기를 계산
        uint completedCount = 0;
        uint pendingCount = 0;
        Vaccination[] storage vaxs = children[childIndex].vaccinations;

        for (uint i = 0; i < vaxs.length; i++) {
            if (vaxs[i].status == VaccinationStatus.Completed) {
                completedCount++;
            } else if (vaxs[i].status == VaccinationStatus.Pending) {
                pendingCount++;
            }
        }

        // VaccinationInfo 구조체에 있는 completed, pending 배열 크기 할당
        VaccinationInfomation memory vaxInfo;
        vaxInfo.completed = new Vaccination[](completedCount);
        vaxInfo.pending = new Vaccination[](pendingCount);

        uint completedIndex = 0;
        uint pendingIndex = 0;

        // 데이터를 분류하여 배열에 넣음
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

    // 자식의 address를 반환하는 코드
    function returnChildAddress(
        string memory _name
    ) public view returns (address) {
        Child[] storage children = parentToChild[msg.sender];
        require(children.length > 0, "No children found");

        for (uint i = 0; i < children.length; i++) {
            if (
                keccak256(abi.encodePacked(children[i].name)) ==
                keccak256(abi.encodePacked(_name))
            ) {
                return children[i].childAddress;
            }
        }

        revert("child with the give name not found");
    }

    // MARK: - 아이 추가, 연동

    // 아이 생성 (테스트 완료)
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
            Vaccination memory vax = recommendedVaccinations[i];

            uint256 startVaxDate = _caculateVaccinationDate(
                _birthDate,
                vax.recommendedAge
            );

            uint256 endVaxDate = _caculateVaccinationDate(
                _birthDate,
                vax.recommendedEndAge
            );

            vax.startVaccinationDate = startVaxDate;
            vax.endVaccinationDate = endVaxDate;

            newChild.vaccinations.push(vax);
        }

        // 자식 주소를 통해서 부모 확인하기
        childToParent[childAddress] = msg.sender;

        emit ChildAdded(msg.sender, childAddress);
    }

    // 아이 연동 함수
    function linkChildToParent(address childAddress) external {
        // 자식 존재 여부
        require(childToParent[childAddress] != address(0), "Child not found");

        //
        Child[] storage children = parentToChild[msg.sender];

        // 자식 주소가 이미 연동이 되어있는지를 확인
        for (uint i = 0; i < children.length; i++) {
            require(
                children[i].childAddress != childAddress,
                "Already linked to this child"
            );
        }

        Child storage child = parentToChild[childToParent[childAddress]][
            _findChildIndex(childAddress)
        ];

        // 새 부모에게도 자식 리스트에 추가
        parentToChild[msg.sender].push(child);

        // 새로운 부모와 자식 연동
        emit ChildLinkedToParent(msg.sender, childAddress);
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

    // 백신 접종 기록 추가
    // 테스트 완료
    function updateChildVaccination(
        string memory _name,
        string memory _vaccineName
    ) external {
        // 자식이 확인이 되지 않으면 에러를 발생
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
                    Vaccination storage vax = childrens[i].vaccinations[j];
                    if (
                        keccak256(abi.encodePacked(vax.vaccineName)) ==
                        keccak256((abi.encodePacked(_vaccineName)))
                    ) {
                        // 자식이 이미 맞은 백신인 경우에 대해서 에러를 발생
                        require(
                            vax.status == VaccinationStatus.Pending,
                            "already vaccination completed"
                        );

                        uint256 currentTime = block.timestamp;
                        require(
                            currentTime >= vax.startVaccinationDate &&
                                currentTime <= vax.endVaccinationDate,
                            "Not in vaccination Period"
                        );

                        // 백신 상태를 Pending -> Complete로 변경
                        vax.status = VaccinationStatus.Completed;

                        // 백신 접종 날짜를 업데이트
                        vax.administeredDate = currentTime;

                        // 백신 접종 이벤트에 대해서 이벤트 생성
                        emit VaccinationUpdated(
                            childrens[i].childAddress,
                            _vaccineName,
                            currentTime
                        );

                        return;
                    }
                }
            }
        }
    }
}
