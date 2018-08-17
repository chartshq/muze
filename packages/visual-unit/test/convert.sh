#!/bin/bash

output_file="data.js"
line_no=0
head=
body=
json="export default [ "


create_block() {
    head_l=("${!1}")
    body_l=("${!2}")
    content=

    res="{ "
    for (( i = 0; i < ${#head_l[*]}; i+=1 ))
    do
        content=`echo "${head_l[i]//$'\r'/}" | sed "s/\"//g" | sed "s/\'//g"`
        res+=$content
        res+=": "
        content=`echo "${body_l[i]//$'\r'/}" | sed "s/\"//g" | sed "s/\'//g"`
        res+=\'${content}\'
        
        res+=","
    done
    res=`echo "$res" | sed 's/.$//'`
    res+=" }"
    echo $res
}

rm $output_file

while IFS='' read -r line || [[ -n "$line" ]]; do
    IFS="," read -r -a array <<< "$line"
    if ((line_no==0))
    then
        head=( "${array[@]}" )
    else
        body=( "${array[@]}" )
        json+=`create_block head[@] body[@]`
        json+=","
    fi

    line_no=$(($line_no+1))
done < "$1"
    
json=`echo "$json" | sed 's/.$//'`
json+=" ]"
echo "$json" >> $output_file
 