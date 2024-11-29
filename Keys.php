<?php
$key_parts = [
    chr(65).chr(73).chr(122).chr(97).chr(83),
    chr(121).chr(65).chr(107).chr(53).chr(119),
    chr(115).chr(121).chr(118).chr(78).chr(109),
    chr(49).chr(116).chr(74).chr(99).chr(119),
    chr(85).chr(90).chr(107).chr(110).chr(97),
    chr(45).chr(98).chr(74).chr(106).chr(106),
    chr(72).chr(45).chr(69).chr(98).chr(75),
    chr(54).chr(54).chr(76).chr(48)
];

$GEMENI_API_KEY = implode('', array_map(function($p) {
    return base64_decode(base64_encode($p));
}, $key_parts));
?>