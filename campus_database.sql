-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2025 at 08:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campus_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `campus_info`
--

CREATE TABLE `campus_info` (
  `campus_id` int(11) NOT NULL,
  `campus_name` varchar(50) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `campus_info`
--

INSERT INTO `campus_info` (`campus_id`, `campus_name`, `location`, `description`) VALUES
(1, 'Merchiston Campus', '10 Colinton Rd, Edinburgh EH10 5DT', 'Engineering and built environment, computing and creative industries students are based at Merchiston. Here you’ll find the Jack Kilby Computing Centre, the Edinburgh Napier Students’ Association, a computer games lab, newsroom, TV, radio and photography studios and soundproofed industry-standard music studios.'),
(2, 'Sighthill Campus', '9 Sighthill Ct, Edinburgh EH11 4BN', 'Our Sighthill campus serves more than 5,000 students and staff of the School of Applied Sciences and the School of Health & Social Care. Facilities include life-like hospital wards, a clinical skills suite, sports science labs and our [EN]GAGE sports centre.'),
(3, 'Craiglockhart Campus', '219 Colinton Rd, Edinburgh EH14 1DJ', 'Home to the Business School, Craiglockhart campus blends the old and the new. Set within attractive grounds overlooking Edinburgh, facilities include 200- and 400-seat lecture theatres and language and multimedia labs.');

-- --------------------------------------------------------

--
-- Table structure for table `class_schedule_info`
--

CREATE TABLE `class_schedule_info` (
  `schedule_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `start_date_time` datetime NOT NULL,
  `end_date_time` datetime NOT NULL,
  `schedule_type` enum('Lecture Session','Practical Session','Exam','Meeting','ENSA Event','Other Event','Presentation / Viva') NOT NULL COMMENT 'Schedule for room can be Lecture, Practical, Exam, Meeting, ENSA event and so on.',
  `status` enum('Available','Unavailable','Repairing','Booked') NOT NULL COMMENT 'Status field describes whether the room is available, unavailable or closed. This helps admin to assign each room for any class or event at particular time.',
  `title` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `class_schedule_info`
--

INSERT INTO `class_schedule_info` (`schedule_id`, `room_id`, `start_date_time`, `end_date_time`, `schedule_type`, `status`, `title`) VALUES
(4, 273, '2025-04-24 12:15:00', '2025-04-24 13:15:00', 'ENSA Event', 'Booked', 'ENSA Event'),
(6, 2, '2025-04-30 08:00:00', '2025-04-30 08:30:00', 'Lecture Session', 'Booked', 'Weekly Booking'),
(7, 274, '2025-04-30 08:00:00', '2025-04-30 08:30:00', 'ENSA Event', 'Booked', 'ENSA Event'),
(14, 278, '2025-04-29 12:14:00', '2025-04-29 12:44:00', 'Meeting', 'Booked', 'Special Event');

-- --------------------------------------------------------

--
-- Table structure for table `navigation_history`
--

CREATE TABLE `navigation_history` (
  `id` int(11) NOT NULL,
  `from_room` varchar(100) DEFAULT NULL,
  `to_room` varchar(100) DEFAULT NULL,
  `floor_from` varchar(10) DEFAULT NULL,
  `floor_to` varchar(10) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `navigation_history`
--

INSERT INTO `navigation_history` (`id`, `from_room`, `to_room`, `floor_from`, `floor_to`, `timestamp`) VALUES
(8, 'L20', 'Stairs20', 'Floor C', 'Floor C', '2025-04-24 01:02:45'),
(9, 'C4', 'C4', 'Floor C', 'Floor C', '2025-04-24 01:03:05'),
(10, 'A15', 'A18d', 'Floor A', 'Floor A', '2025-04-24 22:17:56'),
(11, 'C2', 'C5', 'Floor C', 'Floor C', '2025-04-24 22:18:14'),
(12, 'C2', 'L21', 'Floor C', 'Floor C', '2025-04-24 22:53:07'),
(13, 'L21', 'L21', 'Floor C', 'Floor C', '2025-04-24 22:57:15'),
(15, 'L23', 'L21', 'Floor C', 'Floor C', '2025-04-26 10:18:01'),
(16, 'C2', 'C4', 'Floor C', 'Floor C', '2025-04-26 10:21:17'),
(17, 'C10', 'C4', 'Floor C', 'Floor C', '2025-04-26 10:21:24'),
(18, 'A79a', 'C4', 'Floor A', 'Floor C', '2025-04-26 10:21:34'),
(19, 'L22', 'L21', 'Floor C', 'Floor C', '2025-04-26 10:39:30'),
(20, 'A103', 'A01', 'Floor A', 'Floor A', '2025-04-28 20:51:32'),
(21, 'A16', 'A01', 'Floor A', 'Floor A', '2025-04-28 20:51:40'),
(22, 'A16', 'B1', 'Floor A', 'Floor B', '2025-04-28 20:51:55'),
(23, 'A16', 'B3', 'Floor A', 'Floor B', '2025-04-28 20:52:03'),
(24, 'A16', 'B27', 'Floor A', 'Floor B', '2025-04-28 20:52:11'),
(25, 'A16', 'B3', 'Floor A', 'Floor B', '2025-04-28 20:53:29'),
(26, 'A16', 'B3', 'Floor A', 'Floor B', '2025-04-28 20:53:39'),
(27, 'A110', 'A02', 'Floor A', 'Floor A', '2025-04-29 03:34:23'),
(28, 'A02', 'A109', 'Floor A', 'Floor A', '2025-04-29 03:43:01'),
(29, 'C2', 'C4', 'Floor C', 'Floor C', '2025-04-29 03:43:21'),
(30, 'A15', 'A01', 'Floor A', 'Floor A', '2025-04-29 03:44:02'),
(31, 'A15', 'A01', 'Floor A', 'Floor A', '2025-04-29 03:44:40'),
(32, 'G14', 'A01', 'Floor G', 'Floor A', '2025-04-29 03:44:57'),
(33, 'A02', 'A110', 'Floor A', 'Floor A', '2025-04-29 10:12:39'),
(34, 'A02', 'A103', 'Floor A', 'Floor A', '2025-04-29 10:27:13'),
(35, 'A02', 'Apex Cafe', 'Floor A', 'Floor C', '2025-04-29 10:27:26'),
(36, 'A103', 'A01', 'Floor A', 'Floor A', '2025-04-29 10:33:58');

-- --------------------------------------------------------

--
-- Table structure for table `rooms_booking_info`
--

CREATE TABLE `rooms_booking_info` (
  `booking_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `start_date_time` datetime NOT NULL,
  `end_date_time` datetime NOT NULL,
  `status` enum('Available','Unavailable','Closed','') NOT NULL COMMENT 'status field is used to identify whether each study room (library area) is available, unavailable or closed.',
  `student_id` int(11) NOT NULL COMMENT 'Student ID who booked the room',
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `rooms_booking_info`
--

INSERT INTO `rooms_booking_info` (`booking_id`, `room_id`, `start_date_time`, `end_date_time`, `status`, `student_id`, `title`) VALUES
(13, 269, '2025-04-24 13:11:00', '2025-04-24 16:11:00', '', 41000000, 'Weekly Meeting'),
(14, 1, '2025-04-24 00:00:00', '2025-04-24 03:00:00', '', 41000000, 'Weekly Booking'),
(17, 4, '2025-04-25 10:30:00', '2025-04-25 11:30:00', '', 40010000, 'Weekly Meeting'),
(18, 4, '2025-04-27 08:30:00', '2025-04-27 10:00:00', '', 40010000, 'Weekly Meeting'),
(20, 6, '2025-04-29 07:40:00', '2025-04-29 08:40:00', '', 430000, 'Lab Exam Practice'),
(21, 6, '2025-04-30 07:35:00', '2025-04-30 08:35:00', '', 430000, 'Weekly Booking'),
(22, 6, '2025-05-04 13:00:00', '2025-05-04 14:00:00', '', 440000, 'Weekly Booking'),
(23, 277, '2025-04-30 13:00:00', '2025-04-30 14:00:00', '', 450000, 'Weekly Booking'),
(24, 268, '2025-04-30 13:00:00', '2025-04-30 14:00:00', '', 450000, 'Weekly Booking'),
(25, 1, '2025-04-30 13:00:00', '2025-04-30 15:00:00', '', 450000, 'Weekly Booking'),
(27, 1, '2025-05-08 08:58:00', '2025-05-08 09:58:00', '', 4200000, 'Weekly Booking'),
(28, 1, '2025-04-30 09:02:00', '2025-04-30 10:02:00', '', 41000002, 'Weekly Booking'),
(29, 268, '2025-04-30 09:05:00', '2025-04-30 10:35:00', '', 41000002, 'Weekly Booking'),
(33, 2, '2025-05-06 09:44:00', '2025-05-06 10:44:00', '', 42000000, 'Weekly Booking'),
(34, 276, '2025-05-08 09:44:00', '2025-05-08 10:44:00', '', 42000000, '40643456'),
(36, 4, '2025-04-26 06:30:00', '2025-04-26 11:55:00', '', 51000000, 'Weekly Meeting'),
(37, 4, '2025-04-26 00:00:00', '2025-04-26 02:00:00', '', 40000000, 'Weekly Meeting'),
(38, 3, '2025-04-28 00:00:00', '2025-04-28 02:00:00', '', 41000000, 'Meeting');

-- --------------------------------------------------------

--
-- Table structure for table `room_info`
--

CREATE TABLE `room_info` (
  `room_id` int(11) NOT NULL,
  `room_name` varchar(50) NOT NULL,
  `room_type` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `floor` varchar(50) NOT NULL,
  `x_coordinate` int(11) NOT NULL,
  `y_coordinate` int(11) NOT NULL,
  `campus_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `room_info`
--

INSERT INTO `room_info` (`room_id`, `room_name`, `room_type`, `description`, `floor`, `x_coordinate`, `y_coordinate`, `campus_id`) VALUES
(1, 'L23', 'Library Room', '-', 'Floor C', 0, 0, 1),
(2, 'L22', 'Library Room', '-', 'Floor C', 0, 0, 1),
(3, 'L21', 'Study Pod', 'Study Room 10 - Capacity 4', 'Floor C', 0, 0, 1),
(4, 'L20', 'Study Pod', 'Study Room 9 - Capacity 4', 'Floor C', 0, 0, 1),
(6, 'C2', 'SCEBE Location', 'Laboratory Nano Technology - Capacity 28', 'Floor C', 0, 0, 1),
(7, 'C3', 'SCEBE Location', 'Laboratory Vibration - Capacity 28', 'Floor C', 0, 0, 1),
(8, 'C4', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(9, 'C5', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(10, 'C6', 'SCEBE Location', 'Computer Room - Embedded Systems Lab - Capacity 25', 'Floor C', 0, 0, 1),
(11, 'C7', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(12, 'C8', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(13, 'C9', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(14, 'C10', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(15, 'C11', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(16, 'C16', 'SCEBE Location', 'Laboratory - GP Electronics Lab - Capacity 28', 'Floor C', 0, 0, 1),
(17, 'C17', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(18, 'C18', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(19, 'C19', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(20, 'C20', 'SCEBE Location', 'Laboratory - Capacity 28', 'Floor C', 0, 0, 1),
(21, 'C21', 'Lecture Room', ' ', 'Floor C', 0, 0, 1),
(27, 'C30', 'SCEBE Location', 'Computer Room - DSP Lab - Capacity 24', 'Floor C', 0, 0, 1),
(28, 'C31a', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(29, 'C31', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(30, 'C32', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(31, 'C33', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(32, 'C34b', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(33, 'C34', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(34, 'C34a', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(35, 'C35', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(36, 'C36', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(37, 'C37', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(38, 'C38', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(39, 'C39', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(40, 'C40', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(41, 'C41', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(42, 'C42', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(43, 'C43', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(44, 'C44', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(45, 'C45', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(46, 'C46', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(47, 'C47', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(48, 'C48', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(49, 'C49', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(50, 'C50', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(51, 'C51', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(52, 'C110', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(53, 'C109', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(54, 'C108', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(55, 'C107', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(56, 'C106', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(57, 'C105', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(58, 'C104', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(59, 'C103', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(60, 'C102', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(62, 'C97', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(63, 'C98', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(65, 'C94', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(66, 'C93', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(67, 'C92', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(68, 'C91', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(69, 'C90', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(70, 'C89', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(71, 'C88', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(72, 'C87', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(73, 'C86', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(74, 'C85', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(75, 'C84', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(76, 'C83d', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(77, 'C83c', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(78, 'C83b', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(79, 'C83a', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(80, 'C72', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(81, 'C71', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(82, 'C70', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(83, 'C68', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(84, 'C69', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(85, 'C67', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(86, 'C66', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(87, 'C65', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(88, 'C64', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(89, 'C63', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(90, 'C62', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(91, 'C61', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(92, 'C60', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(93, 'C59', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(94, 'C58', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(95, 'C56', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(96, 'C55', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(97, 'C54', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(98, 'C53', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(99, 'C73', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(100, 'C74', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(101, 'C75', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(102, 'C76', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(103, 'C77', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(104, 'C78', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(105, 'C79', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(106, 'C80', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(107, 'C155', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(109, 'C81', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(110, 'C113', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(111, 'C112', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(112, 'C82b', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(113, 'C82a', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(114, 'C82c', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(115, 'C82f', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(116, 'C82d', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(117, 'C82e', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(118, 'C82g', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(119, 'C82h', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(120, 'C82i', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(121, 'C82j', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(122, 'Apex Cafe', 'Lecture Room', '-', 'Floor C', 0, 0, 1),
(123, 'Stairs1', 'Stairs', 'Stairs', 'Floor C', 0, 0, 1),
(124, 'Stairs21', 'Stairs', '-', 'Floor C', 0, 0, 1),
(125, 'Stairs20', 'Stairs', '-', 'Floor C', 0, 0, 1),
(126, 'Stairs19', 'Stairs', '-', 'Floor C', 0, 0, 1),
(127, 'Stairs18', 'Stairs', '-', 'Floor C', 0, 0, 1),
(128, 'Stairs17', 'Stairs', '-', 'Floor C', 0, 0, 1),
(129, 'Stairs16', 'Stairs', '-', 'Floor C', 0, 0, 1),
(130, 'Stairs13', 'Stairs', '-', 'Floor C', 0, 0, 1),
(131, 'Stairs14', 'Stairs', '-', 'Floor C', 0, 0, 1),
(132, 'Stairs15', 'Stairs', '-', 'Floor C', 0, 0, 1),
(133, 'Stairs12', 'Stairs', '-', 'Floor C', 0, 0, 1),
(134, 'Stairs22', 'Stairs', '-', 'Floor C', 0, 0, 1),
(135, 'Stairs11', 'Stairs', '-', 'Floor C', 0, 0, 1),
(136, 'Stairs23', 'Stairs', '-', 'Floor C', 0, 0, 1),
(137, 'Stairs5', 'Stairs', '-', 'Floor C', 0, 0, 1),
(138, 'Stairs6', 'Stairs', '-', 'Floor C', 0, 0, 1),
(139, 'Stairs7', 'Stairs', '-', 'Floor C', 0, 0, 1),
(140, 'Stairs8', 'Stairs', '-', 'Floor C', 0, 0, 1),
(141, 'Stairs9', 'Stairs', '-', 'Floor C', 0, 0, 1),
(142, 'Stairs4', 'Stairs', '-', 'Floor C', 0, 0, 1),
(143, 'Stairs3', 'Stairs', '-', 'Floor C', 0, 0, 1),
(144, 'Stairs2', 'Stairs', '-', 'Floor C', 0, 0, 1),
(145, 'Elevator1', 'Elevator', 'Elevator', 'Floor C', 0, 0, 1),
(146, 'Elevator2', 'Elevator', 'Elevator', 'Floor C', 0, 0, 1),
(147, 'Elevator3', 'Elevator', 'Elevator', 'Floor C', 0, 0, 1),
(148, 'Elevator4', 'Elevator', 'Elevator', 'Floor C', 0, 0, 1),
(149, 'Elevator5', 'Elevator', 'Elevator', 'Floor C', 0, 0, 1),
(150, 'Elevator6', 'Elevator', 'Elevator', 'Floor C', 0, 0, 1),
(151, 'Library', 'Library Room', 'Library Area', 'Floor C', 0, 0, 1),
(152, 'A79a', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(153, 'A79', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(154, 'A79b', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(155, 'A79c', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(156, 'A79d', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(157, 'A79e', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(158, 'A79f', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(159, 'A80', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(160, 'A81', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(161, 'A82', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(162, 'A83', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(164, 'A110', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(167, 'A4', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(168, 'A3', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(169, 'A5', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(170, 'A5a', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(171, 'A6', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(172, 'A02', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(173, 'A01', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(174, 'A85', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(183, 'A90', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(190, 'A71', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(191, 'A70', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(192, 'A66', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(193, 'A71a', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(194, 'A69', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(195, 'A68', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(196, 'A67', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(197, 'A72', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(198, 'A73', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(199, 'A74', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(200, 'A75', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(201, 'A76', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(202, 'A77', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(203, 'A78', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(204, 'A65', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(205, 'A64', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(206, 'A63', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(207, 'A62', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(208, 'A61', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(209, 'A60', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(210, 'A59', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(211, 'A58', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(212, 'A57', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(213, 'A56', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(214, 'A58a', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(215, 'A58b', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(216, 'A54', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(217, 'A56a', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(218, 'A56b', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(219, 'A55', 'Lecture Room', 'Lecture Theatre', 'Floor A', 0, 0, 1),
(220, 'A53', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(221, 'A52', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(222, 'A47', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(223, 'A46', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(224, 'A45', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(225, 'A42', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(226, 'A41', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(227, 'A44', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(228, 'A43', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(229, 'A38', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(230, 'A40', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(231, 'A39', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(232, 'A37', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(233, 'A103', 'Lecture Room', 'JKCC Plant', 'Floor A', 0, 0, 1),
(234, 'A109', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(235, 'A15', 'SCEBE Location', 'Laboratory - Fluids Lab - Capacity 25', 'Floor A', 0, 0, 1),
(236, 'A16', 'SCEBE Location', 'Laboratory - Project Area RM-Fluid Mechanics - Capacity 25', 'Floor A', 0, 0, 1),
(237, 'A16a', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(238, 'A18d', 'SCEBE Location', 'Laboratory - Materials Lab - Capacity 20', 'Floor A', 0, 0, 1),
(239, 'A18c', 'SCEBE Location', '-', 'Floor A', 0, 0, 1),
(240, 'A18b', 'SCEBE Location', '-', 'Floor A', 0, 0, 1),
(241, 'A18a', 'SCEBE Location', '-', 'Floor A', 0, 0, 1),
(242, 'A18', 'SCEBE Location', '-', 'Floor A', 0, 0, 1),
(243, 'A18e', 'SCEBE Location', 'Laboratory - Materials Lab - Capacity 20', 'Floor A', 0, 0, 1),
(244, 'A19', 'SCEBE Location', 'Laboratory - Materials Avoid Concurrency', 'Floor A', 0, 0, 1),
(245, 'A19b', 'SCEBE Location', 'Laboratory - Workplace - Capacity 1', 'Floor A', 0, 0, 1),
(246, 'A19a', 'SCEBE Location', 'Laboratory - Workplace - Capacity 1', 'Floor A', 0, 0, 1),
(247, 'A17', 'Lecture Room', 'Lecture Theatre', 'Floor A', 0, 0, 1),
(248, 'A20', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(251, 'A22', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(252, 'A21', 'Lecture Room', 'Engine Lab', 'Floor A', 0, 0, 1),
(253, 'A23', 'Lecture Room', 'Welding/Fabrication', 'Floor A', 0, 0, 1),
(254, 'A24', 'Lecture Room', 'Machine Shop', 'Floor A', 0, 0, 1),
(255, 'A25', 'Lecture Room', 'Heavy Structures Lab', 'Floor A', 0, 0, 1),
(256, 'A25a', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(257, 'A2', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(258, 'A26', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(259, 'A28', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(260, 'A29', 'Lecture Room', 'Maintenance Storage', 'Floor A', 0, 0, 1),
(261, 'A30', 'Lecture Room', 'ENC & Built Env. Shared Storage', 'Floor A', 0, 0, 1),
(262, 'A36', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(263, 'A35', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(264, 'A29a', 'Lecture Room', 'Service Area Below JKCC', 'Floor A', 0, 0, 1),
(265, 'A31', 'Lecture Room', 'IS Storage Area', 'Floor A', 0, 0, 1),
(266, 'A27', 'Lecture Room', '-', 'Floor A', 0, 0, 1),
(267, 'JKCC', 'Lecture Room', 'Jack Kilby Computer Suite', 'Floor B', 0, 0, 1),
(268, 'L14', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(269, 'L15', 'Library Room', '', 'Floor B', 0, 0, 1),
(270, 'L16', 'Group Meeting Room', 'Study Room 7 - Capacity 10', 'Floor B', 0, 0, 1),
(271, 'L27', 'Study Pod', 'Study Room 9 - Capacity 4', 'Floor B', 0, 0, 1),
(272, 'L5d', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(273, 'L5c', 'Group Meeting Room', 'Study Room 6 - Capacity 10', 'Floor B', 0, 0, 1),
(274, 'L5b', 'Group Meeting Room', 'Study Room 5 - Capacity 10', 'Floor B', 0, 0, 1),
(275, 'L5a', 'Group Meeting Room', 'Study Room 8 - Capacity 8', 'Floor B', 0, 0, 1),
(276, 'L5', 'Study Pod', 'Study Room 1 - Capacity 4', 'Floor B', 0, 0, 1),
(277, 'L8', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(278, 'L12', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(279, 'L11', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(280, 'L9', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(281, 'L7', 'Group Meeting Room', 'Study Room 4 - Capacity 6', 'Floor B', 0, 0, 1),
(282, 'B77', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(283, 'B76', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(284, 'L6', 'Group Meeting Room', 'Study Room 3 - Capacity 6', 'Floor B', 0, 0, 1),
(285, 'L18', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(286, 'L19', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(287, 'L19a', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(288, 'Library', 'Library Room', 'Library Area', 'Floor B', 0, 0, 1),
(289, 'L2', 'Library Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(290, 'L3', 'Study Pod', 'Study Room 8 - Capacity 2', 'Floor B', 0, 0, 1),
(291, 'L4', 'Lecture Room', 'Library Study Area', 'Floor B', 0, 0, 1),
(292, 'B3', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(295, 'B2', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(296, 'B1', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(299, 'B74', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(300, 'B74a', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(301, 'B74b', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(302, 'B56', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(303, 'B55', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(304, 'B56b', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(305, 'B53', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(306, 'B52', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(307, 'B51', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(308, 'B50', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(309, 'B49', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(310, 'B48', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(311, 'B48a', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(312, 'B48b', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(313, 'B70', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(314, 'B70a', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(315, 'B70b', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(316, 'B70c', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(317, 'B70d', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(318, 'B70e', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(319, 'B41', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(320, 'B40', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(321, 'B39', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(322, 'B38', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(323, 'B37', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(324, 'B33', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(325, 'B34a', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(326, 'B34b', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(327, 'B34', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(328, 'B34c', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(329, 'B35', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(330, 'B11b', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(331, 'B11a', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(332, 'B11', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(333, 'B11c', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(334, 'B11d', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(335, 'B11f', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(336, 'B11g', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(337, 'B11h', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(338, 'B11i', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(339, 'B13', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(340, 'A7', 'Lecture Room', '', 'Floor A', 0, 0, 1),
(341, 'B59', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(342, 'B60', 'SCEBE Location', 'Laboratory - Power Lab - Capacity 25', 'Floor B', 0, 0, 1),
(343, 'B62', 'SCEBE Location', 'Laboratory - Robotics Lab - Capacity 20', 'Floor B', 0, 0, 1),
(344, 'B61', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(345, 'B63', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(346, 'B64', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(347, 'B65', 'SCEBE Location', 'Laboratory - Timber Research - Capacity 10', 'Floor B', 0, 0, 1),
(348, 'B66', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(350, 'B68b', 'SCEBE Location', 'Laboratory - Capacity 16', 'Floor B', 0, 0, 1),
(351, 'B68a', 'SCEBE Location', 'Laboratory - Capacity 20', 'Floor B', 0, 0, 1),
(352, 'B14', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(353, 'B15', 'SCEBE Location', 'Laboratory - Polymer Lab - Capacity 16', 'Floor B', 0, 0, 1),
(354, 'B16', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(355, 'B16a', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(356, 'B17', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(357, 'B27', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(358, 'B26', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(359, 'B28', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(360, 'B30', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(361, 'B31', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(362, 'B32', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(363, 'B24', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(364, 'B23', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(365, 'B22', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(366, 'B21', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(367, 'B20b', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(368, 'B20a', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(369, 'B19', 'Lecture Room', '', 'Floor B', 0, 0, 1),
(370, 'Elevator1', 'Elevator', 'Elevator', 'Floor A', 0, 0, 1),
(371, 'Elevator2', 'Elevator', 'Elevator', 'Floor A', 0, 0, 1),
(372, 'Elevator3', 'Elevator', 'Elevator', 'Floor A', 0, 0, 1),
(373, 'Elevator4', 'Elevator', 'Elevator', 'Floor A', 0, 0, 1),
(374, 'Toilet1', 'Toilet', 'Toilet', 'Floor A', 0, 0, 1),
(375, 'Toilet2', 'Toilet', 'Toilet', 'Floor A', 0, 0, 1),
(376, 'Stairs1', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(377, 'Stairs2', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(378, 'Stairs3', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(379, 'Stairs4', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(380, 'Stairs5', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(381, 'Stairs6', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(382, 'Stairs7', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(383, 'Stairs8', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(384, 'Stairs9', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(385, 'Stairs10', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(386, 'Stairs11', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(387, 'Stairs12', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(388, 'Stairs13', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(389, 'Stairs14', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(390, 'Stairs15', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(391, 'Stairs16', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(392, 'Stairs17', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(393, 'Stairs18', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(394, 'Stairs19', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(395, 'Stairs20', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(396, 'Stairs21', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(397, 'Stairs22', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(398, 'Stairs23', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(399, 'Stairs24', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(400, 'Stairs25', 'Stairs', 'Stairs', 'Floor A', 0, 0, 1),
(401, 'Elevator1', 'Elevator', 'Elevator', 'Floor B', 0, 0, 1),
(402, 'Elevator2', 'Elevator', 'Elevator', 'Floor B', 0, 0, 1),
(403, 'Elevator3', 'Elevator', 'Elevator', 'Floor B', 0, 0, 1),
(404, 'Elevator4', 'Elevator', 'Elevator', 'Floor B', 0, 0, 1),
(405, 'Elevator5', 'Elevator', 'Elevator', 'Floor B', 0, 0, 1),
(406, 'Elevator6', 'Elevator', 'Elevator', 'Floor B', 0, 0, 1),
(407, 'Elevator7', 'Elevator', 'Elevator', 'Floor B', 0, 0, 1),
(408, 'Toilet1', 'Toilet', 'Toilet', 'Floor B', 0, 0, 1),
(409, 'Toilet2', 'Toilet', 'Toilet', 'Floor B', 0, 0, 1),
(410, 'Toilet3', 'Toilet', 'Toilet', 'Floor B', 0, 0, 1),
(411, 'Toilet4', 'Toilet', 'Toilet', 'Floor B', 0, 0, 1),
(412, 'Toilet5', 'Toilet', 'Toilet', 'Floor B', 0, 0, 1),
(413, 'Toilet6', 'Toilet', 'Toilet', 'Floor B', 0, 0, 1),
(414, 'Stairs1', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(415, 'Stairs2', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(416, 'Stairs3', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(417, 'Stairs4', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(418, 'Stairs5', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(419, 'Stairs6', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(420, 'Stairs7', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(421, 'Stairs8', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(422, 'Stairs9', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(423, 'Stairs10', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(424, 'Stairs11', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(425, 'Stairs12', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(426, 'Stairs13', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(427, 'Stairs14', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(428, 'Stairs15', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(429, 'Stairs16', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(430, 'Stairs17', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(431, 'Stairs18', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(432, 'Stairs19', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(433, 'Stairs20', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(434, 'Stairs21', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(435, 'Stairs22', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(436, 'Stairs23', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(437, 'Stairs24', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(438, 'Stairs25', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(439, 'Stairs26', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(440, 'Stairs27', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(441, 'Stairs28', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(442, 'Stairs29', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(443, 'Stairs30', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(444, 'Stairs31', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(445, 'Stairs32', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(446, 'Stairs33', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(447, 'Stairs34', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(448, 'Stairs35', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(449, 'Stairs36', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(450, 'Stairs37', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(451, 'Stairs38', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(452, 'Stairs39', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(453, 'Stairs40', 'Stairs', 'Stairs', 'Floor B', 0, 0, 1),
(459, 'D10', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(460, 'D15a', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(461, 'D20', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(462, 'FemaleWC', 'Toilet', 'Female Toilet', 'Floor D', 0, 0, 1),
(463, 'MaleWC', 'Toilet', 'Male Toilet', 'Floor D', 0, 0, 1),
(464, 'D66', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(465, 'D42', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(466, 'D41', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(467, 'D40', 'SCEBE Location', 'SOC Lab', 'Floor D', 0, 0, 1),
(468, 'D36', 'SCEBE Location', 'Studio Media Lab - Capacity 24', 'Floor D', 0, 0, 1),
(469, 'D45', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(470, 'D46', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(471, 'D39', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(472, 'D38', 'SCEBE Location', 'Audio Suite - Capacity 1', 'Floor D', 0, 0, 1),
(473, 'D37', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(474, 'D35', 'SCEBE Location', 'Studio Video Suite - Capacity 24', 'Floor D', 0, 0, 1),
(475, 'D33', 'SCEBE Location', 'Green Screen Room - Capacity 6', 'Floor D', 0, 0, 1),
(476, 'D32', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(477, 'D31', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(478, 'D30', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(479, 'D29', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(480, 'D28', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(481, 'D26', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(482, 'D24', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(483, 'D22', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(484, 'D21', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(485, 'D19', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(486, 'D18', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(487, 'D17', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(488, 'D9', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(489, 'D7', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(490, 'D2', 'SCEBE Location', 'Code Lab - Capacity 40', 'Floor D', 0, 0, 1),
(492, 'D74', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(493, 'D8', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(494, 'D16', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(495, 'D14a', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(496, 'D13', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(497, 'D12', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(498, 'D11', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(499, 'D65', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(500, 'D67', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(501, 'D4', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(502, 'D2a', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(503, 'D68', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(504, 'D69', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(505, 'D70', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(506, 'D71', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(507, 'D72', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(508, 'D47a', 'SCEBE Location', 'Robot Lab - Capacity 1', 'Floor D', 0, 0, 1),
(509, 'D47b', 'SCEBE Location', 'Robot Lab - Capacity 1', 'Floor D', 0, 0, 1),
(510, 'D73', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(511, 'D65a', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(512, 'D14', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(513, 'D15', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(514, 'D23', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(515, 'D27', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(516, 'D25', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(517, 'D44', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(518, 'D47', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(519, 'D50', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(520, 'D51', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(521, 'D52', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(522, 'D53', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(523, 'D54', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(524, 'D55', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(525, 'D56', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(526, 'D57', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(527, 'D58', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(528, 'D59', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(529, 'D59a', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(530, 'D60', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(531, 'D62', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(532, 'D64', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(533, 'D63', 'Lecture Room', '', 'Floor D', 0, 0, 1),
(534, 'Stairs1', 'Stairs', 'Stairs', 'Floor D', 0, 0, 1),
(535, 'Stairs2', 'Stairs', 'Stairs', 'Floor D', 0, 0, 1),
(536, 'Stairs3', 'Stairs', 'Stairs', 'Floor D', 0, 0, 1),
(537, 'Stairs4', 'Stairs', 'Stairs', 'Floor D', 0, 0, 1),
(538, 'Elevator1', 'Elevator', 'Elevator', 'Floor D', 0, 0, 1),
(539, 'Elevator2', 'Elevator', 'Elevator', 'Floor D', 0, 0, 1),
(540, 'Elevator3', 'Elevator', 'Elevator', 'Floor D', 0, 0, 1),
(541, 'E17', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(542, 'E16', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(543, 'E14a', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(544, 'E14', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(545, 'E13', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(546, 'E12', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(547, 'E12a', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(548, 'E11', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(549, 'E10', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(550, 'E9', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(551, 'E8', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(552, 'E7', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(553, 'E3', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(554, 'E4', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(555, 'E34', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(556, 'E35', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(557, 'E36', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(558, 'E37', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(559, 'E38', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(560, 'E39', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(561, 'E40', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(562, 'E41', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(563, 'E42', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(564, 'E43', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(565, 'E44', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(566, 'E45', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(567, 'E46', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(568, 'E47', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(569, 'E48', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(570, 'E49', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(571, 'E50', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(572, 'E51', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(573, 'E52', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(574, 'E53', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(575, 'E54', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(576, 'E55', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(577, 'E56', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(578, 'E33', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(579, 'E32', 'SCEBE Location', 'Computer Room - Computer Lab - Capacity 32', 'Floor E', 0, 0, 1),
(580, 'E31', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(581, 'E28', 'SCEBE Location', 'Laboratory - Product Design Engineering - Capacity 25', 'Floor E', 0, 0, 1),
(582, 'E27', 'SCEBE Location', 'Laboratory - Architectural Technology Lab - Capacity 40', 'Floor E', 0, 0, 1),
(583, 'E25', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(584, 'E24', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(585, 'E23', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(586, 'E22', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(587, 'E21', 'Lecture Room', '', 'Floor E', 0, 0, 1),
(588, 'Elevator1', 'Elevator', 'Elevator', 'Floor E', 0, 0, 1),
(589, 'Elevator2', 'Elevator', 'Elevator', 'Floor E', 0, 0, 1),
(590, 'Elevator3', 'Elevator', 'Elevator', 'Floor E', 0, 0, 1),
(591, 'Stairs1', 'Stairs', 'Stairs', 'Floor E', 0, 0, 1),
(592, 'Stairs2', 'Stairs', 'Stairs', 'Floor E', 0, 0, 1),
(593, 'Stairs3', 'Stairs', 'Stairs', 'Floor E', 0, 0, 1),
(594, 'Stairs4', 'Stairs', 'Stairs', 'Floor E', 0, 0, 1),
(596, 'F2', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(597, 'F3', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(598, 'F4', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(599, 'F4a', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(600, 'F5', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(601, 'F6', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(602, 'F7', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(603, 'F8', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(604, 'F9', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(605, 'F9a', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(606, 'F10', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(607, 'F11', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(608, 'F12', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(609, 'F12a', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(610, 'F13', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(611, 'F14', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(612, 'F15', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(613, 'Stairs1', 'Stairs', 'Stairs', 'Floor F', 0, 0, 1),
(614, 'Stairs2', 'Stairs', 'Stairs', 'Floor F', 0, 0, 1),
(615, 'Stairs3', 'Stairs', 'Stairs', 'Floor F', 0, 0, 1),
(616, 'Elevator1', 'Elevator', 'Elevator', 'Floor F', 0, 0, 1),
(617, 'Elevator2', 'Elevator', 'Elevator', 'Floor F', 0, 0, 1),
(618, 'F44', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(619, 'F43a', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(620, 'F43b', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(621, 'F40', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(622, 'F41', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(623, 'F42', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(624, 'F39', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(625, 'F38', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(626, 'F37b', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(627, 'F37a', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(628, 'F37', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(629, 'F36', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(630, 'F35', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(631, 'F35a', 'Lecture Room', NULL, 'Floor F', 0, 0, 1),
(633, 'G2', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(634, 'G4', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(635, 'G5', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(636, 'G6', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(637, 'G7', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(638, 'G8', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(639, 'G9', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(640, 'G14', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(641, 'G15', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(642, 'G16', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(643, 'G17', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(644, 'G18', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(645, 'G19', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(646, 'G20', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(647, 'G21', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(648, 'G21a', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(649, 'G22', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(650, 'G23', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(651, 'G24', 'Lecture Room', NULL, 'Floor G', 0, 0, 1),
(652, 'Elevator1', 'Elevator', 'Elevator', 'Floor G', 0, 0, 1),
(653, 'Elevator2', 'Elevator', 'Elevator', 'Floor G', 0, 0, 1),
(654, 'Stairs1', 'Stairs', 'Stairs', 'Floor G', 0, 0, 1),
(655, 'Stairs2', 'Stairs', 'Stairs', 'Floor G', 0, 0, 1),
(656, 'H9', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(657, 'H8', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(658, 'H7', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(659, 'H5', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(660, 'H4', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(661, 'H3', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(662, 'H2', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(664, 'H10', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(665, 'H11', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(666, 'H12', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(667, 'H13', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(668, 'H14', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(669, 'H15', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(670, 'H16', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(671, 'H15a', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(672, 'H17', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(673, 'H18', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(674, 'H18b', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(675, 'H18a', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(676, 'H18c', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(677, 'H18d', 'Lecture Room', NULL, 'Floor H', 0, 0, 1),
(680, 'Stairs1', 'Stairs', 'Stairs', 'Floor H', 0, 0, 1),
(681, 'Stairs2', 'Stairs', 'Stairs', 'Floor H', 0, 0, 1),
(682, 'Stairs', 'Stairs', 'Stairs', 'Floor H', 0, 0, 1),
(683, 'Elevator1', 'Elevator', 'Elevator', 'Floor H', 0, 0, 1),
(684, 'Elevator2', 'Elevator', 'Elevator', 'Floor H', 0, 0, 1),
(687, 'B69', 'SCEBE Location', 'Studio - Design Studio - Capacity 20', 'Floor B', 0, 0, 1),
(688, 'C24', 'Lecture Room', NULL, 'Floor C', 0, 0, 1),
(689, 'C27', 'SCEBE Location', 'Computer Networking Lab - Capacity 50', 'Floor C', 0, 0, 1),
(690, 'C28', 'SCEBE Location', 'Computer Room - Computing Interactions Lab - Capacity 24', 'Floor C', 0, 0, 1),
(691, 'C21a', 'SCEBE Location', 'C21a', 'Floor C', 0, 0, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `campus_info`
--
ALTER TABLE `campus_info`
  ADD PRIMARY KEY (`campus_id`);

--
-- Indexes for table `class_schedule_info`
--
ALTER TABLE `class_schedule_info`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `navigation_history`
--
ALTER TABLE `navigation_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms_booking_info`
--
ALTER TABLE `rooms_booking_info`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `room_info`
--
ALTER TABLE `room_info`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `campus_info`
--
ALTER TABLE `campus_info`
  MODIFY `campus_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `class_schedule_info`
--
ALTER TABLE `class_schedule_info`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `navigation_history`
--
ALTER TABLE `navigation_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `rooms_booking_info`
--
ALTER TABLE `rooms_booking_info`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `room_info`
--
ALTER TABLE `room_info`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=692;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `class_schedule_info`
--
ALTER TABLE `class_schedule_info`
  ADD CONSTRAINT `class_schedule_info_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room_info` (`room_id`);

--
-- Constraints for table `rooms_booking_info`
--
ALTER TABLE `rooms_booking_info`
  ADD CONSTRAINT `rooms_booking_info_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room_info` (`room_id`);

--
-- Constraints for table `room_info`
--
ALTER TABLE `room_info`
  ADD CONSTRAINT `room_info_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campus_info` (`campus_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
