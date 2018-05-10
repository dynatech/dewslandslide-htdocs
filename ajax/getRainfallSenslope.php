<?php  

	/**
	 * Author: Kevin Dhale dela Cruz
	 *
	 * Returns an array $rain_info containing all rows
	 * returned by the query from corresponding rain_Senslope
	 * table of each site
	 *
	 * @param      string  		$site       
	 * @param      timestamp  	$start_date  
	 * @param      timestamp  	$end_date
	 * @param      int			$limit 		Number of row to be retrieved
	 * 
	 * @return     object 	$rain_info->[property] 
	 * 						where:	x is the row number of result
	 *						property is field to access certain property
	 *						(return is in JSON format)
	 */
	function getRainfallSenslope($site, $start_date, $end_date = null, $limit = null, $host, $db, $user, $pass)
	{
		/*
		$host = "localhost";
		$user = "root";
		$pass = "senslope";
		$db = "senslopedb";
		*/

		/**
		* Object that will be returned
		*/
		class Senslope
		{
			public $max_rain_2year;
			public $rain_senslope = [];
		}

		$con = mysqli_connect($host, $user, $pass, $db);
		if ( mysqli_connect_errno() ) {
			echo "Failed to connect to MySQL: " . mysqli_connect_error();
		}

		$query = "SELECT rain_senslope, max_rain_2year FROM site_rain_props WHERE LEFT(name,3) = '$site' AND rain_senslope IS NOT NULL";
		$result = mysqli_query($con, $query);
		$output = mysqli_fetch_object($result);
		//echo "Table name: " . $output[0];
		//var_dump($output);

		if( is_null($output->rain_senslope) ) {
			echo "Site \"$site\" has no corresponding \"rain_senslope\" values.";
			return;
		}
		else {
			$query = "SELECT * FROM $output->rain_senslope WHERE timestamp > '$start_date'";
			if (!is_null($end_date)) $query = $query . " AND timestamp <= '$end_date'";
			if(!is_null($limit)) $query = $query . " LIMIT $limit";
			//echo $query;

			$result = mysqli_query($con, $query);

			$rain_info = new Senslope;
			$rain_info->max_rain_2year = $output->max_rain_2year;

			$i = 0;
			while ($row = mysqli_fetch_assoc($result)) {
				$rain_info->rain_senslope[$i] = $row;
				//var_dump($rain_info);
				$i = $i + 1;
			}
		}

		mysqli_close($con);
		return json_encode($rain_info);

	}

	# Testing Area
	# getRainfallARQ('agb', '2015-10-20', '2016-01-01');
?>