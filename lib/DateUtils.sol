// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library DateUtils {
    function isLeapYear(uint256 year) internal pure returns (bool) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }

    function getDaysInMonth(
        uint256 month,
        uint256 year
    ) internal pure returns (uint256) {
        if (month == 2) {
            return isLeapYear(year) ? 29 : 28;
        } else if (month <= 7) {
            return (month % 2 == 0) ? 30 : 31;
        } else {
            return (month % 2 == 0) ? 31 : 30;
        }
    }

    function unixToYYYYMMDD(uint256 unixTime) internal pure returns (uint256) {
        uint256 secondsInADay = 86400;
        uint256 totalDays = unixTime / secondsInADay;
        uint256 year = 1970;
        uint256 daysInYear;

        while (totalDays >= (daysInYear = isLeapYear(year) ? 366 : 365)) {
            totalDays -= daysInYear;
            year++;
        }

        uint256 month = 1;
        uint256 day;

        while (true) {
            uint256 daysInMonth = getDaysInMonth(month, year);
            if (totalDays < daysInMonth) {
                day = totalDays + 1;
                break;
            }
            totalDays -= daysInMonth;
            month++;
        }

        return (year * 10000) + (month * 100) + day;
    }
}
