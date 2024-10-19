-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: pawmatch
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'user','user@gmail.com','$2b$10$wwhbsnRBT9/1Sd8TWWoguuI9k1ZCyBwIH34YTjlOBjdPNzZjnNCxe'),(2,'user','user@gmail.com','$2b$10$ZUp8TMdD0absYGtCA56.r.xJ2JbPvNl4w9NmHsUvtiAuDNsKljT4e'),(3,'harman','preetharman2908@gmail.com','$2b$10$mWCoVIankAFOsRBoLpLotOZ3C1O/jfS0lm3TuGEaE032uuJHqAIiG'),(4,'sharan','sharan@gmail.com','$2b$10$ClwRFpcSIdga471bZUrZdOX5N2XICZGiSmppXw48gsC5X8Wla2nCu'),(5,'sharan','sharan@gmail.com','$2b$10$3WsjSqDUmfJgcvh9M6KkqumG2Ar6J5svbYVfKaDNDjsvu7j6hvYum'),(6,'user','user@gmail.com','$2b$10$DK2j4ydlpu67xG0wmFHjMewiWZ1qblG6xkbsT0njjpLshtOx58Cpy'),(7,'sukh','sukh@gmail.com','sukh@12345'),(8,'rani','rani@yahoo.com','rani@12345'),(9,'guri','guri@gmail.com','$2b$10$gdQ9AdMlIfXEVV2zkk.iOucDqOl1Pg6CqVtFsM9JLLQxIigubRYT2'),(10,'abc','abc@gmail.com','$2b$10$iw8Ta0uepBm78vlPJlblpukpWKIHucFcBxU92zDffBqX4kDhHqiD.'),(11,'efg','efg@gmail.com','$2b$10$b//oCgjtoWUye5vV6.GOieXSa4cYIGaSAEq74j7hzS7sjsOBLGETm'),(12,'sinda','sinda@gmail.com','$2b$10$pDhA5aQRRIK2rPKWPySBguCyePs3CDDftY9vSMty0lmuSQgNLs29.');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-18 20:20:31
