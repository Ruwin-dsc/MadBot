-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mar. 04 juin 2024 à 08:28
-- Version du serveur : 10.4.27-MariaDB
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `madbot`
--

-- --------------------------------------------------------

--
-- Structure de la table `bans`
--

CREATE TABLE `bans` (
  `ID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `userID` varchar(255) NOT NULL,
  `authorID` varchar(255) NOT NULL,
  `banID` varchar(255) NOT NULL,
  `reason` varchar(2000) NOT NULL,
  `time` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `kicks`
--

CREATE TABLE `kicks` (
  `ID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `userID` varchar(255) NOT NULL,
  `authorID` varchar(255) NOT NULL,
  `kickID` varchar(255) NOT NULL,
  `reason` varchar(2000) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `logs`
--

CREATE TABLE `logs` (
  `guildID` varchar(255) NOT NULL,
  `enable` varchar(2000) NOT NULL,
  `disable` varchar(2000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mutes`
--

CREATE TABLE `mutes` (
  `ID` varchar(255) NOT NULL,
  `userID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `authorID` varchar(255) NOT NULL,
  `muteID` varchar(255) NOT NULL,
  `reason` varchar(2000) NOT NULL,
  `time` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paliers`
--

CREATE TABLE `paliers` (
  `ID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `warns` varchar(255) NOT NULL,
  `sanction` varchar(255) NOT NULL,
  `time` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `serveur`
--

CREATE TABLE `serveur` (
  `guildID` varchar(255) NOT NULL,
  `lang` varchar(255) NOT NULL,
  `experience` varchar(255) NOT NULL,
  `channelexperience` varchar(255) NOT NULL,
  `moderation` varchar(255) NOT NULL,
  `channellogs` varchar(255) NOT NULL,
  `captcha` varchar(255) NOT NULL,
  `captcharole` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `temp`
--

CREATE TABLE `temp` (
  `ID` varchar(255) NOT NULL,
  `userID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `banID` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `ID` varchar(255) NOT NULL,
  `userID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `xp` varchar(255) NOT NULL,
  `level` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `voc`
--

CREATE TABLE `voc` (
  `ID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `userID` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `warns`
--

CREATE TABLE `warns` (
  `ID` varchar(255) NOT NULL,
  `guildID` varchar(255) NOT NULL,
  `userID` varchar(255) NOT NULL,
  `authorID` varchar(255) NOT NULL,
  `warnID` varchar(255) NOT NULL,
  `reason` varchar(2000) NOT NULL,
  `date` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `bans`
--
ALTER TABLE `bans`
  ADD PRIMARY KEY (`banID`);

--
-- Index pour la table `kicks`
--
ALTER TABLE `kicks`
  ADD PRIMARY KEY (`kickID`);

--
-- Index pour la table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`guildID`);

--
-- Index pour la table `mutes`
--
ALTER TABLE `mutes`
  ADD PRIMARY KEY (`muteID`);

--
-- Index pour la table `paliers`
--
ALTER TABLE `paliers`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `serveur`
--
ALTER TABLE `serveur`
  ADD PRIMARY KEY (`guildID`);

--
-- Index pour la table `temp`
--
ALTER TABLE `temp`
  ADD PRIMARY KEY (`banID`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `voc`
--
ALTER TABLE `voc`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `warns`
--
ALTER TABLE `warns`
  ADD PRIMARY KEY (`warnID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
