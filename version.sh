echo $(date -u +%y.%m.%d).$(printf "%05d\n" $(date -u "+(%H*60+%M)*60+%S" | bc))